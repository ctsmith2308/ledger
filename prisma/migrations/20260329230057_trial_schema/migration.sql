-- AlterTable
ALTER TABLE "identity"."user_sessions" ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE "identity"."users" ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'TRIAL';
