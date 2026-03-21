import 'dotenv/config';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';
import { validateAndLogServiceConfig } from './utils/serviceConfig';

const PORT = parseInt(process.env.PORT ?? '', 10) || 5000;

async function main() {
  try {
    validateAndLogServiceConfig();
  } catch (err) {
    logger.error(String(err));
    process.exit(1);
  }

  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error(
      'Failed to connect to database. ' +
      'Ensure DATABASE_URL (or DATABASE_PRIVATE_URL on Railway) is set to a valid ' +
      'PostgreSQL connection string (postgresql://user:password@host:5432/db).',
      err
    );
    process.exit(1);
  }

  const { default: app } = await import('./app');

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
