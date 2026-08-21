import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { globalRateLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { v1Router } from './routes/v1/index.js';
import { NotFoundError } from './errors/AppError.js';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy in production for rate limiters and IP headers
  app.set('trust proxy', 1);

  // Security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Normalize configured CLIENT_URL (remove trailing slashes / path)
        let clientOrigin = env.CLIENT_URL;
        try {
          clientOrigin = new URL(env.CLIENT_URL).origin;
        } catch {
          // keep original
        }

        const allowed = [
          clientOrigin,
          env.CLIENT_URL,
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://vidhannahar.github.io',
        ];

        if (
          allowed.includes(origin) ||
          origin.endsWith('.github.io') ||
          origin.startsWith('http://localhost:')
        ) {
          return callback(null, true);
        }

        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    })
  );

  // Structured HTTP Request Logging
  app.use(
    (pinoHttp as any)({
      logger,
      autoLogging: env.NODE_ENV !== 'test',
    })
  );

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Global Rate Limiting
  app.use(globalRateLimiter);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    });
  });

  // Mount API v1 Routes
  app.use('/api/v1', v1Router);

  // Handle 404 for unknown API routes
  app.use('/api/*', (req: Request, _res: Response, next) => {
    next(new NotFoundError(`API endpoint '${req.originalUrl}' does not exist`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
