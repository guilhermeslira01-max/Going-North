import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ data: null, error: 'Token de autenticação ausente', message: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ data: null, error: 'Token inválido ou expirado', message: 'Unauthorized' });
      return;
    }

    // Fetch profile to get role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    req.user = {
      id: data.user.id,
      email: data.user.email ?? '',
      role: profile?.role ?? 'free',
    };

    next();
  } catch {
    res.status(500).json({ data: null, error: 'Erro ao verificar autenticação', message: 'Internal Server Error' });
  }
}

export function requireRole(role: 'admin') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ data: null, error: 'Acesso negado', message: 'Forbidden' });
      return;
    }
    next();
  };
}
