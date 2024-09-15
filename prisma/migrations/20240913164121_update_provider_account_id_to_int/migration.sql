/*
  Warnings:

  - Changed the type of `providerAccountId` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "providerAccountId",
ADD COLUMN     "providerAccountId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
