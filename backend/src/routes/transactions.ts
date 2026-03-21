import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const transactionSchema = z.object({
  desc: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().positive('Valor deve ser positivo'),
  tipo: z.enum(['receita', 'despesa']),
  cat: z.string().min(1, 'Categoria é obrigatória'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
});

// GET /transactions
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tipo, cat, mes, busca, page = '1', limit = '20' } = req.query;

  let query = supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', req.user!.id)
    .order('data', { ascending: false });

  if (tipo) query = query.eq('tipo', tipo);
  if (cat) query = query.eq('cat', cat);
  if (mes) {
    const [year, month] = (mes as string).split('-');
    const start = `${year}-${month}-01`;
    const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    query = query.gte('data', start).lte('data', end);
  }
  if (busca) query = query.ilike('desc', `%${busca}%`);

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao buscar transações' });
    return;
  }

  res.json({ data, error: null, message: 'OK', meta: { total: count, page: pageNum, limit: limitNum } });
});

// GET /transactions/summary — resumo mensal
router.get('/summary', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { mes } = req.query;
  const now = new Date();
  const year = mes ? (mes as string).split('-')[0] : now.getFullYear().toString();
  const month = mes ? (mes as string).split('-')[1] : String(now.getMonth() + 1).padStart(2, '0');

  const start = `${year}-${month}-01`;
  const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('tipo, valor, cat')
    .eq('user_id', req.user!.id)
    .gte('data', start)
    .lte('data', end);

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao buscar resumo' });
    return;
  }

  const receitas = data.filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
  const despesas = data.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0);
  const saldo = receitas - despesas;

  // By category
  const byCat: Record<string, number> = {};
  data.filter((t) => t.tipo === 'despesa').forEach((t) => {
    byCat[t.cat] = (byCat[t.cat] || 0) + Number(t.valor);
  });

  res.json({
    data: { receitas, despesas, saldo, byCat, mes: `${year}-${month}` },
    error: null,
    message: 'OK',
  });
});

// GET /transactions/monthly — últimos 6 meses para gráfico
router.get('/monthly', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const results = await Promise.all(
    months.map(async ({ year, month }) => {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0).toISOString().split('T')[0];

      const { data } = await supabaseAdmin
        .from('transactions')
        .select('tipo, valor')
        .eq('user_id', req.user!.id)
        .gte('data', start)
        .lte('data', end);

      const receitas = (data || []).filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
      const despesas = (data || []).filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0);

      return { mes: `${year}-${String(month).padStart(2, '0')}`, receitas, despesas, saldo: receitas - despesas };
    })
  );

  res.json({ data: results, error: null, message: 'OK' });
});

// POST /transactions
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({ ...parsed.data, user_id: req.user!.id })
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao criar transação' });
    return;
  }

  res.status(201).json({ data, error: null, message: 'Transação criada com sucesso' });
});

// PUT /transactions/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = transactionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update(parsed.data)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao atualizar transação' });
    return;
  }

  res.json({ data, error: null, message: 'Transação atualizada com sucesso' });
});

// DELETE /transactions/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: error.message, message: 'Erro ao deletar transação' });
    return;
  }

  res.json({ data: null, error: null, message: 'Transação removida com sucesso' });
});

export default router;
