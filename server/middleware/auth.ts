import { Request, Response, NextFunction } from 'express';
import { supabaseServer } from '../supabase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: string;
      };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    const token = authHeader.substring(7);
    
    // Vérifier le token auprès de Supabase
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Récupérer les informations utilisateur depuis notre DB
    const { data: dbUser, error: userError } = await supabaseServer
      .from('users')
      .select('id, email, type, name')
      .eq('id', user.id)
      .single();

    if (userError || !dbUser) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      type: dbUser.type
    };

    next();
  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    return res.status(500).json({ error: 'Erreur serveur authentification' });
  }
};

export const requireAuth = authenticateUser;
export const requireProfessional = async (req: Request, res: Response, next: NextFunction) => {
  await authenticateUser(req, res, () => {
    if (req.user?.type !== 'professional') {
      return res.status(403).json({ error: 'Compte professionnel requis' });
    }
    next();
  });
};