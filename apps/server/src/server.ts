import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './db/client.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 PlacePrep API Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  logger.info(`🔗 API Base URL: http://localhost:${env.PORT}/api/v1`);
  logger.info(`🩺 Health check: http://localhost:${env.PORT}/health`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('🔌 HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('🗄️ Database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during database disconnect');
      process.exit(1);
    }
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('⏰ Shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
