import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

const PORT = parseInt(process.env.PORT ?? '', 10) || 5000;

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error('Failed to connect to database', err);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
