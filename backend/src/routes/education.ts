import { Router, Response, Request } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { generateArticle } from '../utils/externalApis';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Rate limit: max 5 AI requests per minute per user
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) => (req as AuthenticatedRequest).user?.id ?? req.ip ?? 'unknown',
  message: { data: null, error: 'Muitas requisições. Aguarde 1 minuto.', message: 'Too Many Requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

const askSchema = z.object({
  topic: z.string().min(3, 'Tópico deve ter no mínimo 3 caracteres').max(200, 'Tópico muito longo'),
});

// Education tracks data
const TRACKS = [
  {
    id: 'iniciante',
    nome: 'Trilha Iniciante',
    descricao: 'Fundamentos das finanças pessoais',
    cor: '#368547',
    topicos: [
      { id: 1, titulo: 'O que é orçamento pessoal?', topic: 'orçamento pessoal e controle financeiro' },
      { id: 2, titulo: 'Como criar uma reserva de emergência', topic: 'reserva de emergência finanças pessoais' },
      { id: 3, titulo: 'Entendendo o Tesouro Direto', topic: 'Tesouro Direto para iniciantes' },
      { id: 4, titulo: 'Dívidas: como sair delas', topic: 'como quitar dívidas e sair do vermelho' },
      { id: 5, titulo: 'CDB e Poupança: diferenças', topic: 'comparação CDB e poupança rendimento' },
      { id: 6, titulo: 'Planejamento financeiro básico', topic: 'planejamento financeiro pessoal básico' },
    ],
  },
  {
    id: 'intermediario',
    nome: 'Trilha Intermediária',
    descricao: 'Investimentos e crescimento patrimonial',
    cor: '#c8a96e',
    topicos: [
      { id: 7, titulo: 'Ações na Bolsa de Valores', topic: 'como investir em ações na bolsa de valores brasileira' },
      { id: 8, titulo: 'Fundos Imobiliários (FIIs)', topic: 'fundos imobiliários FIIs como investir' },
      { id: 9, titulo: 'Diversificação de carteira', topic: 'diversificação de carteira de investimentos' },
      { id: 10, titulo: 'Análise fundamentalista', topic: 'análise fundamentalista de ações para iniciantes' },
      { id: 11, titulo: 'ETFs e fundos de índice', topic: 'ETFs e fundos de índice no Brasil' },
      { id: 12, titulo: 'Imposto de renda em investimentos', topic: 'imposto de renda sobre investimentos no Brasil' },
    ],
  },
  {
    id: 'avancado',
    nome: 'Trilha Avançada',
    descricao: 'Estratégias e independência financeira',
    cor: '#003333',
    topicos: [
      { id: 13, titulo: 'Independência financeira (FIRE)', topic: 'independência financeira FIRE no Brasil' },
      { id: 14, titulo: 'Análise técnica de ativos', topic: 'análise técnica de ações e ativos financeiros' },
      { id: 15, titulo: 'Derivativos e opções', topic: 'derivativos e opções financeiras no Brasil' },
      { id: 16, titulo: 'Investimentos internacionais', topic: 'como investir no exterior sendo brasileiro' },
      { id: 17, titulo: 'Previdência privada PGBL/VGBL', topic: 'previdência privada PGBL VGBL diferenças e estratégias' },
      { id: 18, titulo: 'Sucessão patrimonial', topic: 'planejamento sucessório e patrimonial no Brasil' },
    ],
  },
];

const GLOSSARY = [
  { termo: 'Ação', definicao: 'Título que representa uma fração do capital social de uma empresa.' },
  { termo: 'Aporte', definicao: 'Valor investido ou adicionado a uma aplicação financeira.' },
  { termo: 'B3', definicao: 'Brasil, Bolsa, Balcão — a bolsa de valores oficial do Brasil.' },
  { termo: 'CDI', definicao: 'Certificado de Depósito Interbancário — referência para rendimentos de renda fixa.' },
  { termo: 'CDB', definicao: 'Certificado de Depósito Bancário — investimento de renda fixa emitido por bancos.' },
  { termo: 'Dividendo', definicao: 'Parcela do lucro de uma empresa distribuída aos acionistas.' },
  { termo: 'ETF', definicao: 'Exchange Traded Fund — fundo de investimento negociado em bolsa que replica um índice.' },
  { termo: 'FII', definicao: 'Fundo de Investimento Imobiliário — fundo que investe em ativos imobiliários.' },
  { termo: 'IPCA', definicao: 'Índice de Preços ao Consumidor Amplo — índice oficial de inflação do Brasil.' },
  { termo: 'LCI/LCA', definicao: 'Letras de Crédito Imobiliário/Agrícola — investimentos de renda fixa isentos de IR.' },
  { termo: 'P/L', definicao: 'Preço/Lucro — indicador que mede quantos anos levaria para recuperar o investimento.' },
  { termo: 'Rentabilidade', definicao: 'Retorno percentual obtido em um investimento em relação ao capital investido.' },
  { termo: 'Renda Fixa', definicao: 'Investimento com rendimento previsível, definido no momento da aplicação.' },
  { termo: 'Renda Variável', definicao: 'Investimento cujo retorno não é garantido e varia conforme o mercado.' },
  { termo: 'Selic', definicao: 'Taxa básica de juros da economia brasileira, definida pelo Banco Central.' },
  { termo: 'Tesouro Direto', definicao: 'Programa do governo federal para venda de títulos públicos a pessoas físicas.' },
  { termo: 'Volatilidade', definicao: 'Medida de oscilação dos preços de um ativo no mercado.' },
  { termo: 'Yield', definicao: 'Rendimento de um ativo em relação ao seu preço, expresso em percentual.' },
  { termo: 'Reserva de Emergência', definicao: 'Valor guardado para cobrir despesas inesperadas, geralmente 3-6 meses de gastos.' },
  { termo: 'Juros Compostos', definicao: 'Sistema onde os juros incidem sobre o capital + juros acumulados anteriormente.' },
];

// GET /education/tracks
router.get('/tracks', (_req: Request, res: Response): void => {
  res.json({ data: TRACKS, error: null, message: 'OK' });
});

// GET /education/glossary
router.get('/glossary', (_req: Request, res: Response): void => {
  const { busca, letra } = _req.query;
  let result = GLOSSARY;

  if (busca) {
    result = result.filter(
      (g) =>
        g.termo.toLowerCase().includes((busca as string).toLowerCase()) ||
        g.definicao.toLowerCase().includes((busca as string).toLowerCase())
    );
  }

  if (letra) {
    result = result.filter((g) => g.termo.toUpperCase().startsWith((letra as string).toUpperCase()));
  }

  res.json({ data: result.sort((a, b) => a.termo.localeCompare(b.termo)), error: null, message: 'OK' });
});

// POST /education/ask — generate AI article (requires auth)
router.post('/ask', requireAuth, aiRateLimit, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.errors[0].message, message: 'Validation error' });
    return;
  }

  try {
    const article = await generateArticle(parsed.data.topic);
    res.json({ data: { html: article, topic: parsed.data.topic }, error: null, message: 'OK' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao gerar artigo', message: 'Service Unavailable' });
  }
});

// GET /education/article/:topicId — get article for a track topic
router.get('/article/:topicId', requireAuth, aiRateLimit, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const topicId = parseInt(req.params.topicId);
  let foundTopic: { titulo: string; topic: string } | null = null;

  for (const track of TRACKS) {
    const t = track.topicos.find((t) => t.id === topicId);
    if (t) { foundTopic = t; break; }
  }

  if (!foundTopic) {
    res.status(404).json({ data: null, error: 'Tópico não encontrado', message: 'Not Found' });
    return;
  }

  try {
    const article = await generateArticle(foundTopic.topic);
    res.json({ data: { html: article, title: foundTopic.titulo, topic: foundTopic.topic }, error: null, message: 'OK' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao gerar artigo', message: 'Service Unavailable' });
  }
});

export default router;
