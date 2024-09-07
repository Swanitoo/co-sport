/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `informationText` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `noteText` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `reviewText` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `thanksText` on the `Product` table. All the data in the column will be lost.
  - Added the required column `sport` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "backgroundColor",
DROP COLUMN "image",
DROP COLUMN "informationText",
DROP COLUMN "noteText",
DROP COLUMN "reviewText",
DROP COLUMN "thanksText",
ADD COLUMN     "sport" TEXT NOT NULL;
