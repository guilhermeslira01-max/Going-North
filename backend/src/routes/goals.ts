import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const goalSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  total: z.number().positive('Valor total deve ser positivo'),
  atual: z.number().min(0).default(0),
  prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  cor: z.string().default('#368547'),
});

const aporteSchema = z.object({
  valor: z.number().positive('Valor do aporte deve ser positivo'),
});

// GET /goals
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data, error } = await supabaseAdmin
    .from('goals')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('prazo', { ascending: true });

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao buscar metas' });
    return;
  }

  res.json({ data, error: null, message: 'OK' });
});

// POST /goals
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('goals')
    .insert({ ...parsed.data, user_id: req.user!.id })
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao criar meta' });
    return;
  }

  res.status(201).json({ data, error: null, message: 'Meta criada com sucesso' });
});

// PUT /goals/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = goalSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('goals')
    .update(parsed.data)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao atualizar meta' });
    return;
  }

  res.json({ data, error: null, message: 'Meta atualizada com sucesso' });
});

// POST /goals/:id/aporte — add deposit to goal
router.post('/:id/aporte', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = aporteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  // Fetch current goal
  const { data: goal, error: fetchError } = await supabaseAdmin
    .from('goals')
    .select('atual, total')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single();

  if (fetchError || !goal) {
    res.status(404).json({ data: null, error: 'Meta não encontrada', message: 'Not Found' });
    return;
  }

  const novoAtual = Math.min(Number(goal.atual) + parsed.data.valor, Number(goal.total));

  const { data, error } = await supabaseAdmin
    .from('goals')
    .update({ atual: novoAtual })
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao realizar aporte' });
    return;
  }

  res.json({ data, error: null, message: 'Aporte realizado com sucesso' });
});

// DELETE /goals/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('goals')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao deletar meta' });
    return;
  }

  res.json({ data: null, error: null, message: 'Meta removida com sucesso' });
});

export default router;
