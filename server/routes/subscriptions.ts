import { Router } from 'express';
import Stripe from 'stripe';
import { supabaseServer } from '../supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plans d'abonnements avec tarifs serveur (sécurisé)
const SUBSCRIPTION_PLANS = {
  'starter-monthly': {
    name: 'Starter Pro',
    price: 19.90,
    maxListings: 20,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER
  },
  'business-monthly': {
    name: 'Business Pro', 
    price: 39.90,
    maxListings: 50,
    stripe_price_id: process.env.STRIPE_PRICE_BUSINESS
  },
  'premium-monthly': {
    name: 'Premium Pro',
    price: 79.90, 
    maxListings: -1,
    stripe_price_id: process.env.STRIPE_PRICE_PREMIUM
  }
};

// POST /api/subscriptions/create - Créer un nouvel abonnement
router.post('/create', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const { planId } = req.body;

    // Validation du plan côté serveur (sécurité anti-tampering)
    const planConfig = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!planConfig) {
      return res.status(400).json({ error: 'Plan d\'abonnement invalide' });
    }

    // Récupérer l'utilisateur avec customer Stripe
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;

      // Sauvegarder l'ID customer
      await supabaseServer
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Créer la subscription Stripe (récurrente)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: planConfig.stripe_price_id
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        planId: planId,
        userId: userId
      }
    });

    // Créer l'enregistrement d'abonnement en base
    const { data: dbSubscription, error: subError } = await supabaseServer
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        plan_name: planConfig.name,
        price: planConfig.price,
        max_listings: planConfig.maxListings,
        status: 'pending',
        stripe_subscription_id: subscription.id
      })
      .select()
      .single();

    if (subError) {
      console.error('❌ Erreur création abonnement DB:', subError);
      return res.status(500).json({ error: 'Erreur création abonnement' });
    }

    const latestInvoice = subscription.latest_invoice as any;
    const clientSecret = latestInvoice?.payment_intent?.client_secret;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret
    });

  } catch (error) {
    console.error('❌ Erreur création abonnement Stripe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/subscriptions/current - Récupérer l'abonnement actuel de l'utilisateur
router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const { data: subscription, error } = await supabaseServer
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erreur récupération abonnement:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json(subscription || null);

  } catch (error) {
    console.error('❌ Erreur récupération abonnement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/subscriptions/cancel - Annuler un abonnement
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Récupérer l'abonnement actif
    const { data: subscription, error: subError } = await supabaseServer
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'Aucun abonnement actif trouvé' });
    }

    // Annuler chez Stripe (ne facture plus mais reste actif jusqu'à la fin de période)
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      });
    }

    // Marquer l'abonnement comme annulé (reste actif jusqu'à la fin de la période)
    const { error: updateError } = await supabaseServer
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('❌ Erreur annulation abonnement:', updateError);
      return res.status(500).json({ error: 'Erreur annulation' });
    }

    res.json({ message: 'Abonnement annulé avec succès. Il restera actif jusqu\'à la fin de la période en cours.' });

  } catch (error) {
    console.error('❌ Erreur annulation abonnement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Webhook Stripe pour confirmer les paiements (nécessite raw body)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: éviter les traitements multiples
  const { data: processedEvent } = await supabaseServer
    .from('stripe_events_processed')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (processedEvent) {
    return res.json({ received: true, message: 'Already processed' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any;
        
        await supabaseServer
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'pending',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            activated_at: subscription.status === 'active' ? new Date().toISOString() : null
          })
          .eq('stripe_subscription_id', subscription.id);
        
        console.log(`✅ Subscription ${subscription.status}:`, subscription.id);
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as any;
        
        await supabaseServer
          .from('subscriptions')
          .update({
            status: 'expired',
            cancelled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', deletedSub.id);
        
        console.log('✅ Subscription expired:', deletedSub.id);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          // Renouvellement réussi
          console.log('✅ Payment succeeded for subscription:', invoice.subscription);
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any;
        if (failedInvoice.subscription) {
          // TODO: Gérer les échecs de paiement (alertes utilisateur, grace period)
          console.log('❌ Payment failed for subscription:', failedInvoice.subscription);
        }
        break;
    }

    // Marquer l'événement comme traité
    await supabaseServer
      .from('stripe_events_processed')
      .insert({ stripe_event_id: event.id, processed_at: new Date().toISOString() });

  } catch (error) {
    console.error('❌ Erreur traitement webhook:', error);
    return res.status(500).json({ error: 'Webhook processing error' });
  }

  res.json({ received: true });
});

export { router as subscriptionsRouter };