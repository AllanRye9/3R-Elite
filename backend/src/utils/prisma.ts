import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// On Railway, DATABASE_PRIVATE_URL is the internal private network URL for
// PostgreSQL (faster, no egress costs, no public proxy). Fall back to
// DATABASE_URL for local development and other environments.
const databaseUrl = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
