/*
  Warnings:

  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- Vérifier si la colonne userId existe déjà dans la table Review
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Review'
        AND column_name = 'userId'
    ) THEN
        -- Ajouter la colonne userId seulement si elle n'existe pas déjà
        ALTER TABLE "Review" ADD COLUMN "userId" TEXT NOT NULL;
    END IF;
END $$;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- RenameForeignKey
ALTER TABLE "messages" RENAME CONSTRAINT "messages_productId_fkey" TO "messages_product_fkey";

-- RenameForeignKey
ALTER TABLE "messages" RENAME CONSTRAINT "messages_userId_fkey" TO "messages_user_fkey";

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'Review_userId_fkey'
    ) THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'messages_userId_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'messages_productId_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
