import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, path: req.path, method: req.method }, '❌ Non-operational AppError occurred');
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.constructor.name,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Unhandled / unexpected exception
  logger.error({ err, path: req.path, method: req.method }, '💥 Unhandled Server Exception');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
