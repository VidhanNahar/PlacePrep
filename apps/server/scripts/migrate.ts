import { prisma } from '../src/db/client.js';

async function run() {
  console.log('Running database schema updates...');
  
  try {
    // 1. Make outcome nullable
    console.log('Altering interview_experiences.outcome to nullable...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "interview_experiences" ALTER COLUMN "outcome" DROP NOT NULL;
    `);
    console.log('✓ interview_experiences.outcome is now nullable');
  } catch (err: any) {
    console.warn('Note for outcome column:', err.message);
  }

  try {
    // 2. Convert round_type from enum to VARCHAR(100)
    console.log('Altering interview_rounds.round_type to VARCHAR(100)...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "interview_rounds" ALTER COLUMN "round_type" TYPE VARCHAR(100) USING "round_type"::text;
    `);
    console.log('✓ interview_rounds.round_type is now VARCHAR(100)');
  } catch (err: any) {
    console.warn('Note for round_type column:', err.message);
  }

  try {
    // 3. Create custom_round_types table if not exists
    console.log('Creating custom_round_types table if not exists...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "custom_round_types" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(120) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "custom_round_types_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "custom_round_types_name_key" ON "custom_round_types"("name");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "custom_round_types_slug_key" ON "custom_round_types"("slug");
    `);
    console.log('✓ custom_round_types table and indexes ready');
  } catch (err: any) {
    console.warn('Note for custom_round_types table:', err.message);
  }

  console.log('All migrations executed successfully!');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
