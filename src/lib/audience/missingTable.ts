import { Prisma } from '@prisma/client';

/**
 * "Table does not exist": P2021 from the query engine, or P2010 wrapping
 * Postgres 42P01 for a raw query. Nothing else counts. Pure — unit-tested.
 */
export function isMissingTable(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (e.code === 'P2021') return true;
  return e.code === 'P2010' && (e.meta as { code?: string } | undefined)?.code === '42P01';
}
