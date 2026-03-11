import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Resolve the database URL.  On Railway, DATABASE_PRIVATE_URL is the internal
// private-network URL for PostgreSQL (faster, no egress costs, no public proxy).
// Fall back to DATABASE_URL for local development and other environments.
const rawUrl = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error(
    'No database URL found. Set DATABASE_URL (or DATABASE_PRIVATE_URL on Railway) ' +
    'to a valid PostgreSQL connection string, e.g. ' +
    'postgresql://user:password@host:5432/dbname'
  );
}

// Normalise the legacy "postgres://" scheme to "postgresql://" so Prisma's
// wasm-based schema validator never emits the P1012 error at runtime.
const databaseUrl = rawUrl.startsWith('postgres://')
  ? rawUrl.replace('postgres://', 'postgresql://')
  : rawUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
