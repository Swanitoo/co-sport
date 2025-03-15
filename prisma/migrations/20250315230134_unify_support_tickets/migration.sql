/*
  Warnings:

  - You are about to drop the `ContactMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactMessageUserResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContactMessage" DROP CONSTRAINT "ContactMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContactMessageUserResponse" DROP CONSTRAINT "ContactMessageUserResponse_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ContactMessageUserResponse" DROP CONSTRAINT "ContactMessageUserResponse_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContactResponse" DROP CONSTRAINT "ContactResponse_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ContactResponse" DROP CONSTRAINT "ContactResponse_messageId_fkey";

-- DropTable
DROP TABLE "ContactMessage";

-- DropTable
DROP TABLE "ContactMessageUserResponse";

-- DropTable
DROP TABLE "ContactResponse";

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parent_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "SupportTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Migrer les messages de contact principaux vers SupportTicket
INSERT INTO "SupportTicket" ("id", "subject", "message", "userId", "createdAt", "updatedAt", "isResolved", "isAdmin")
SELECT "id", "subject", "message", "userId", "createdAt", "updatedAt", "isResolved", false
FROM "ContactMessage";

-- Migrer les réponses admin vers SupportTicket (comme enfants)
INSERT INTO "SupportTicket" ("id", "message", "userId", "parent_id", "createdAt", "updatedAt", "isResolved", "isAdmin")
SELECT 
  "id", 
  "response", 
  "adminId", 
  "messageId", 
  "createdAt", 
  "createdAt", 
  false, 
  true
FROM "ContactResponse";

-- Migrer les réponses utilisateur vers SupportTicket (comme enfants)
INSERT INTO "SupportTicket" ("id", "message", "userId", "parent_id", "createdAt", "updatedAt", "isResolved", "isAdmin")
SELECT 
  "id", 
  "message", 
  "userId", 
  "messageId", 
  "createdAt", 
  "createdAt", 
  false, 
  false
FROM "ContactMessageUserResponse";

-- DropTable
DROP TABLE "ContactResponse";

-- DropTable
DROP TABLE "ContactMessageUserResponse";

-- DropTable
DROP TABLE "ContactMessage";
