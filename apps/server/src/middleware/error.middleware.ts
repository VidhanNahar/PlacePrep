import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
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

  // Zod validation errors (if thrown outside validation middleware)
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: 'ValidationError',
        message: 'Request validation failed',
        details: formattedErrors,
      },
    });
    return;
  }

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      res.status(409).json({
        success: false,
        error: {
          code: 'ConflictError',
          message: `A record with this ${target.join(', ') || 'field'} already exists.`,
          details: err.meta,
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NotFoundError',
          message: 'Requested record was not found or could not be updated.',
        },
      });
      return;
    }
  }

  // JSON syntax error in body parser
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BadRequestError',
        message: 'Malformed JSON payload in request body',
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
