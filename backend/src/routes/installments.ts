import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const installmentSchema = z.object({
  desc: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().positive('Valor deve ser positivo'),
  total: z.number().int().positive('Total de parcelas deve ser positivo'),
  pagas: z.number().int().min(0).default(0),
  venc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  cat: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['ativo', 'concluido', 'cancelado']).default('ativo'),
});

// GET /installments
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status } = req.query;

  let query = supabaseAdmin
    .from('installments')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('venc', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao buscar parcelas' });
    return;
  }

  // Add alert for installments due within 7 days
  const today = new Date();
  const enriched = (data || []).map((inst) => {
    const daysUntilDue = Math.ceil((new Date(inst.venc).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...inst, daysUntilDue, alertVencimento: daysUntilDue <= 7 && daysUntilDue >= 0 };
  });

  res.json({ data: enriched, error: null, message: 'OK' });
});

// GET /installments/summary
router.get('/summary', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data, error } = await supabaseAdmin
    .from('installments')
    .select('valor, total, pagas, status')
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao buscar resumo' });
    return;
  }

  const ativos = (data || []).filter((i) => i.status === 'ativo');
  const totalRestante = ativos.reduce((s, i) => s + Number(i.valor) * (Number(i.total) - Number(i.pagas)), 0);
  const totalMensal = ativos.reduce((s, i) => s + Number(i.valor), 0);

  res.json({
    data: { totalRestante, totalMensal, quantidadeAtivas: ativos.length },
    error: null,
    message: 'OK',
  });
});

// POST /installments
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = installmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('installments')
    .insert({ ...parsed.data, user_id: req.user!.id })
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao criar parcelamento' });
    return;
  }

  res.status(201).json({ data, error: null, message: 'Parcelamento criado com sucesso' });
});

// PUT /installments/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = installmentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('installments')
    .update(parsed.data)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao atualizar parcelamento' });
    return;
  }

  res.json({ data, error: null, message: 'Parcelamento atualizado com sucesso' });
});

// POST /installments/:id/pagar — mark next installment as paid
router.post('/:id/pagar', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data: inst, error: fetchError } = await supabaseAdmin
    .from('installments')
    .select('pagas, total')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single();

  if (fetchError || !inst) {
    res.status(404).json({ data: null, error: 'Parcelamento não encontrado', message: 'Not Found' });
    return;
  }

  const novasPagas = Number(inst.pagas) + 1;
  const novoStatus = novasPagas >= Number(inst.total) ? 'concluido' : 'ativo';

  const { data, error } = await supabaseAdmin
    .from('installments')
    .update({ pagas: novasPagas, status: novoStatus })
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao marcar parcela como paga' });
    return;
  }

  res.json({ data, error: null, message: 'Parcela marcada como paga' });
});

// DELETE /installments/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('installments')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao deletar parcelamento' });
    return;
  }

  res.json({ data: null, error: null, message: 'Parcelamento removido com sucesso' });
});

export default router;
