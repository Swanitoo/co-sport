/*
  Warnings:

  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_product_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_user_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- DropEnum
DROP TYPE "Plan";

-- RenameForeignKey
ALTER TABLE "messages" RENAME CONSTRAINT "messages_productId_fkey" TO "messages_product_fkey";

-- RenameForeignKey
ALTER TABLE "messages" RENAME CONSTRAINT "messages_userId_fkey" TO "messages_user_fkey";
