import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

// Validate required environment variables early so operators get a clear
// message instead of a cryptic JWT runtime error.
// DATABASE_URL / DATABASE_PRIVATE_URL are validated inside utils/prisma.ts.
const jwtMissing = ['JWT_SECRET', 'JWT_REFRESH_SECRET'].filter((v) => !process.env[v]);
if (jwtMissing.length > 0) {
  logger.error(`Missing required environment variables: ${jwtMissing.join(', ')}`);
  process.exit(1);
}

const PORT = parseInt(process.env.PORT ?? '', 10) || 5000;

async function main() {
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

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
