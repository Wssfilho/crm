import 'dotenv/config';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);
  return url.toString();
}

const schemaId = randomUUID();
const databaseURL = generateUniqueDatabaseURL(schemaId);

process.env.DATABASE_URL = databaseURL;
process.env.DIRECT_URL = databaseURL;

execSync('npm exec prisma migrate deploy', {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: databaseURL,
    DIRECT_URL: databaseURL,
  },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    {
      connectionString: databaseURL,
    },
    { schema: schemaId },
  ),
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
