import { Router } from 'express';
import Stripe from 'stripe';
import { supabaseServer } from '../supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/subscription-plans - Récupérer tous les plans disponibles  
router.get('/plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabaseServer
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération plans:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json(plans || []);
  } catch (error) {
    console.error('❌ Erreur récupération plans:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/create-checkout-session - Créer session Stripe Checkout
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, userEmail } = req.body;

    // Validation des paramètres
    if (!planId || !userEmail) {
      return res.status(400).json({ 
        error: 'planId et userEmail sont requis' 
      });
    }

    console.log(`🔄 Création session checkout pour plan ${planId}, user ${userEmail}`);

    // Récupérer le plan depuis la base de données
    const { data: plan, error: planError } = await supabaseServer
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      console.error('❌ Plan non trouvé:', planError);
      return res.status(400).json({ 
        error: 'Plan d\'abonnement invalide ou inactif' 
      });
    }

    if (!plan.stripe_price_id) {
      console.error('❌ Plan sans Price ID Stripe:', plan);
      return res.status(500).json({ 
        error: 'Configuration Stripe manquante pour ce plan' 
      });
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      success_url: `${process.env.FRONTEND_URL || 'https://' + req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://' + req.get('host')}/plans`,
      metadata: {
        planId: planId.toString(),
        userEmail: userEmail,
        planName: plan.name
      }
    });

    console.log(`✅ Session checkout créée: ${session.id}`);

    res.json({
      sessionUrl: session.url
    });

  } catch (error) {
    console.error('❌ Erreur création session checkout:', error);
    res.status(500).json({ error: 'Erreur création session de paiement' });
  }
});

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
    let customerId = user.stripeCustomerId;
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
        .update({ stripeCustomerId: customerId })
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

// POST /api/subscriptions/handle-success - Traiter le retour de succès Stripe
router.post('/handle-success', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID manquant' });
    }
    
    console.log('🔄 Traitement du succès Stripe, session:', sessionId);
    
    // Récupérer les détails de la session Stripe (sans expansion trop profonde)
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    
    if (!session.subscription) {
      return res.status(400).json({ error: 'Pas d\'abonnement trouvé dans la session' });
    }
    
    const subscription = session.subscription as any;
    const customerEmail = session.customer_details?.email;
    
    if (!customerEmail) {
      return res.status(400).json({ error: 'Email client manquant' });
    }
    
    console.log('📧 Email client:', customerEmail);
    console.log('💳 Abonnement Stripe:', subscription.id);
    
    // Récupérer les détails de l'abonnement sans expansion
    const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);
    
    // Debug : afficher la structure des données
    console.log('🔍 Structure subscription:', JSON.stringify(fullSubscription.items.data[0], null, 2));
    
    // Récupérer les détails du prix séparément  
    const priceData = fullSubscription.items.data[0].price as any;
    const priceId = typeof priceData === 'string' ? priceData : priceData.id;
    const priceDetails = await stripe.prices.retrieve(priceId);
    
    const amount = (priceDetails.unit_amount || 0) / 100; // Convertir de centimes
    
    console.log('🎯 Détails produit - Prix:', priceId, 'Montant:', amount);
    
    // Trouver ou créer l'utilisateur dans notre table users
    let { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, email, name')
      .eq('email', customerEmail)
      .single();
      
    if (userError && userError.code === 'PGRST116') {
      // L'utilisateur n'existe pas dans notre table, récupérons-le depuis auth
      console.log('🔄 Utilisateur non trouvé dans table users, recherche dans auth...');
      
      const { data: authUsers, error: authError } = await supabaseServer.auth.admin.listUsers();
      
      if (authError || !authUsers.users) {
        console.error('❌ Erreur récupération auth users:', authError);
        return res.status(404).json({ error: 'Utilisateur introuvable dans auth' });
      }
      
      const authUser = authUsers.users.find(u => u.email === customerEmail);
      if (!authUser) {
        console.error('❌ Utilisateur introuvable dans auth:', customerEmail);
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }
      
      // Créer l'utilisateur dans notre table
      const { data: createdUser, error: createError } = await supabaseServer
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          created_at: new Date().toISOString()
        })
        .select('id, email, name')
        .single();
        
      if (createError) {
        console.error('❌ Erreur création utilisateur:', createError);
        return res.status(500).json({ error: 'Erreur création utilisateur' });
      }
      
      user = createdUser;
      console.log('✅ Utilisateur créé dans table users:', user.id);
    } else if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return res.status(500).json({ error: 'Erreur récupération utilisateur' });
    }
    
    // Trouver le plan d'abonnement correspondant
    const { data: plan, error: planError } = await supabaseServer
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();
      
    if (planError || !plan) {
      console.error('❌ Plan introuvable:', planError);
      return res.status(404).json({ error: 'Plan d\'abonnement introuvable' });
    }
    
    console.log('📋 Plan trouvé:', plan.name);
    
    // Vérifier si un abonnement existe déjà pour cet utilisateur
    const { data: existingSubscription } = await supabaseServer
      .from('subscriptions')
      .select('id')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .single();
    
    // Créer ou mettre à jour l'abonnement en base
    const subscriptionData = {
      user_id: user!.id,
      plan_id: plan.id,
      plan_name: plan.name,
      price: amount,
      max_listings: plan.maxListings || plan.max_listings,
      stripe_subscription_id: fullSubscription.id,
      status: 'active' as const,
      // Les dates Stripe seront mises à jour par webhook plus tard
      current_period_start: null,
      current_period_end: null,
    };

    if (existingSubscription) {
      console.log('⚠️ Mise à jour abonnement existant...');
      const { error: updateError } = await supabaseServer
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);
        
      if (updateError) {
        console.error('⚠️ Erreur mise à jour abonnement (non critique):', updateError);
      } else {
        console.log('✅ Abonnement mis à jour');
      }
    } else {
      console.log('🆕 Création nouvel abonnement...');
      const { error: insertError } = await supabaseServer
        .from('subscriptions')
        .insert(subscriptionData);
        
      if (insertError) {
        console.error('⚠️ Erreur création abonnement (non critique):', insertError);
      } else {
        console.log('✅ Nouvel abonnement créé');
      }
    }
    
    console.log('✅ Paiement Stripe confirmé - Abonnement traité');
    
    console.log('✅ Abonnement traité avec succès');
    
    // Marquer le profil utilisateur comme complété s'il ne l'est pas
    console.log('🔄 Mise à jour profil utilisateur...');
    const { error: profileError } = await supabaseServer
      .from('users')
      .update({ profile_completed: true })
      .eq('id', user!.id);
      
    if (profileError) {
      console.error('⚠️ Erreur mise à jour profil (non critique):', profileError);
    }
    
    console.log('✅ Profil utilisateur marqué comme complété');
    
    // Réponse avec les détails pour l'interface
    res.json({
      success: true,
      planName: plan.name,
      amount: amount,
      period: 'mensuel',
      userId: user!.id,
      subscriptionId: fullSubscription.id
    });
    
  } catch (error) {
    console.error('❌ Erreur traitement succès Stripe:', error);
    res.status(500).json({ 
      error: 'Erreur lors du traitement du paiement',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export { router as subscriptionsRouter };