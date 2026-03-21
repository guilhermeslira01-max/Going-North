import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getStockQuotes } from '../utils/externalApis';

const router = Router();
router.use(requireAuth);

const investmentSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['acao', 'fii', 'renda_fixa', 'cripto', 'fundo', 'tesouro', 'outro']),
  inst: z.string().min(1, 'Instituição é obrigatória'),
  aporte: z.number().positive('Aporte deve ser positivo'),
  atual: z.number().min(0).default(0),
  taxa: z.number().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
});

// GET /investments
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data, error } = await supabaseAdmin
    .from('investments')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('data', { ascending: false });

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao buscar investimentos' });
    return;
  }

  const totalAporte = (data || []).reduce((s, i) => s + Number(i.aporte), 0);
  const totalAtual = (data || []).reduce((s, i) => s + Number(i.atual), 0);
  const rentabilidade = totalAporte > 0 ? ((totalAtual - totalAporte) / totalAporte) * 100 : 0;

  res.json({
    data: {
      investments: data,
      summary: { totalAporte, totalAtual, rentabilidade },
    },
    error: null,
    message: 'OK',
  });
});

// GET /investments/quotes — real-time stock quotes
router.get('/quotes', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await getStockQuotes();
    res.json({ data: result, error: null, message: 'OK' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao buscar cotações', message: 'Service Unavailable' });
  }
});

// GET /investments/quotes/refresh — force refresh quotes
router.get('/quotes/refresh', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await getStockQuotes(true);
    res.json({ data: result, error: null, message: 'Cotações atualizadas' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao atualizar cotações', message: 'Service Unavailable' });
  }
});

// POST /investments
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = investmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  // Set atual = aporte if not provided
  const payload = {
    ...parsed.data,
    atual: parsed.data.atual || parsed.data.aporte,
    user_id: req.user!.id,
  };

  const { data, error } = await supabaseAdmin.from('investments').insert(payload).select().single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao criar investimento' });
    return;
  }

  res.status(201).json({ data, error: null, message: 'Investimento adicionado com sucesso' });
});

// PUT /investments/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = investmentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('investments')
    .update(parsed.data)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao atualizar investimento' });
    return;
  }

  res.json({ data, error: null, message: 'Investimento atualizado com sucesso' });
});

// DELETE /investments/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('investments')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao deletar investimento' });
    return;
  }

  res.json({ data: null, error: null, message: 'Investimento removido com sucesso' });
});

export default router;
