import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { email, password, name } = parsed.data;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    res.status(400).json({ data: null, error: error.message, message: 'Registration failed' });
    return;
  }

  if (data.user) {
    // Create profile
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      name,
      role: 'free',
    });
  }

  res.status(201).json({
    data: { user: data.user, session: data.session },
    error: null,
    message: 'Conta criada com sucesso! Verifique seu email.',
  });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    res.status(401).json({ data: null, error: 'Email ou senha incorretos', message: 'Authentication failed' });
    return;
  }

  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  res.json({
    data: {
      user: { ...data.user, profile },
      session: data.session,
    },
    error: null,
    message: 'Login realizado com sucesso',
  });
});

// POST /auth/logout
router.post('/logout', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  await supabase.auth.signOut();
  res.json({ data: null, error: null, message: 'Logout realizado com sucesso' });
});

// GET /auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user!.id)
    .single();

  res.json({ data: profile, error: null, message: 'OK' });
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(400).json({ data: null, error: 'refresh_token é obrigatório', message: 'Bad Request' });
    return;
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error) {
    res.status(401).json({ data: null, error: error.message, message: 'Token refresh failed' });
    return;
  }

  res.json({ data: data.session, error: null, message: 'Token atualizado' });
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ data: null, error: 'Email é obrigatório', message: 'Bad Request' });
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  });

  if (error) {
    res.status(400).json({ data: null, error: error.message, message: 'Error' });
    return;
  }

  res.json({ data: null, error: null, message: 'Email de recuperação enviado' });
});

export default router;
