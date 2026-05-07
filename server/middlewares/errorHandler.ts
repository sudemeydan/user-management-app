import { Request, Response, NextFunction } from 'express';

export interface AppErrorType extends Error {
  statusCode?: number;
  status?: string;
}

const errorHandler = (err: AppErrorType, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  console.error(`[ERROR] ${statusCode} - ${err.message}`, err);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(statusCode).json({
    success: false,
    status: status,
    message: err.message
  });
};

export default errorHandler;
