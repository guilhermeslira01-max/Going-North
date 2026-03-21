import { Router, Response, Request } from 'express';
import { getNews, getIndicators } from '../utils/externalApis';

const router = Router();

// GET /news — news feed (cached)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getNews();
    res.json({ data: result, error: null, message: 'OK' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao buscar notícias', message: 'Service Unavailable' });
  }
});

// GET /news/refresh — force refresh (respects 30min minimum)
router.get('/refresh', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getNews(true);
    res.json({ data: result, error: null, message: 'Notícias atualizadas' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao atualizar notícias', message: 'Service Unavailable' });
  }
});

// GET /news/indicators — market indicators (cached)
router.get('/indicators', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getIndicators();
    res.json({ data: result, error: null, message: 'OK' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao buscar indicadores', message: 'Service Unavailable' });
  }
});

// GET /news/indicators/refresh — force refresh indicators
router.get('/indicators/refresh', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getIndicators(true);
    res.json({ data: result, error: null, message: 'Indicadores atualizados' });
  } catch {
    res.status(503).json({ data: null, error: 'Erro ao atualizar indicadores', message: 'Service Unavailable' });
  }
});

export default router;
