import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import goalRoutes from './routes/goals';
import installmentRoutes from './routes/installments';
import investmentRoutes from './routes/investments';
import educationRoutes from './routes/education';
import newsRoutes from './routes/news';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://going-north.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { data: null, error: 'Muitas requisições. Tente novamente em 1 minuto.', message: 'Too Many Requests' },
});
app.use(globalRateLimit);

// ─── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/goals', goalRoutes);
app.use('/installments', installmentRoutes);
app.use('/investments', investmentRoutes);
app.use('/education', educationRoutes);
app.use('/news', newsRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Going North API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
