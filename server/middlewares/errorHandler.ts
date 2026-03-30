import { Request, Response, NextFunction } from 'express';

export interface AppErrorType extends Error {
  statusCode?: number;
  status?: string;
}

const errorHandler = (err: AppErrorType, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error(`[ğŸ’¥ HATA] ${err.statusCode} - ${err.message}`);

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message
  });
};

export default errorHandler;
