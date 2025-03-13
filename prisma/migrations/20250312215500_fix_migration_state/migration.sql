-- DropFailed
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250312213152_add_default_id_to_user';

-- ReapplyCorrectState
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP; 