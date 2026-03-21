import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Erro interno do servidor';

  console.error(`[ERROR] ${statusCode}: ${message}`, err.stack);

  res.status(statusCode).json({
    data: null,
    error: message,
    message: statusCode >= 500 ? 'Erro interno do servidor' : message,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    data: null,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
    message: 'Not Found',
  });
}
