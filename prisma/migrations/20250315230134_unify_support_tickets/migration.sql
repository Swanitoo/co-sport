/*
  Warnings:

  - You are about to drop the `ContactMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactMessageUserResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactResponse` table. If the table is not empty, all the data it contains will be lost.

*/

-- Utilisation d'une fonction conditionnelle pour vérifier l'existence des tables
DO $$ 
BEGIN
    -- Vérifier et supprimer la contrainte de clé étrangère si elle existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ContactMessage_userId_fkey'
    ) THEN
        ALTER TABLE "ContactMessage" DROP CONSTRAINT "ContactMessage_userId_fkey";
    END IF;

    -- Vérifier et supprimer la contrainte de clé étrangère si elle existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ContactMessageUserResponse_messageId_fkey'
    ) THEN
        ALTER TABLE "ContactMessageUserResponse" DROP CONSTRAINT "ContactMessageUserResponse_messageId_fkey";
    END IF;

    -- Vérifier et supprimer la contrainte de clé étrangère si elle existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ContactMessageUserResponse_userId_fkey'
    ) THEN
        ALTER TABLE "ContactMessageUserResponse" DROP CONSTRAINT "ContactMessageUserResponse_userId_fkey";
    END IF;

    -- Vérifier et supprimer la contrainte de clé étrangère si elle existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ContactResponse_adminId_fkey'
    ) THEN
        ALTER TABLE "ContactResponse" DROP CONSTRAINT "ContactResponse_adminId_fkey";
    END IF;

    -- Vérifier et supprimer la contrainte de clé étrangère si elle existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ContactResponse_messageId_fkey'
    ) THEN
        ALTER TABLE "ContactResponse" DROP CONSTRAINT "ContactResponse_messageId_fkey";
    END IF;
END $$;

-- Création de la nouvelle table SupportTicket
CREATE TABLE IF NOT EXISTS "SupportTicket" (
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

-- Ajouter les clés étrangères
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "SupportTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Modifier la table User (uniquement si isAdmin n'existe pas déjà)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'isAdmin'
    ) THEN
        -- La colonne existe déjà, ne rien faire
        NULL;
    ELSE
        -- Ajouter la colonne
        ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Migration conditionnelle des données
DO $$ 
BEGIN
    -- Migrer les messages de contact principaux si la table existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'ContactMessage'
    ) THEN
        INSERT INTO "SupportTicket" ("id", "subject", "message", "userId", "createdAt", "updatedAt", "isResolved", "isAdmin")
        SELECT "id", "subject", "message", "userId", "createdAt", "updatedAt", "isResolved", false
        FROM "ContactMessage";
    END IF;

    -- Migrer les réponses admin si la table existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'ContactResponse'
    ) THEN
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
    END IF;

    -- Migrer les réponses utilisateur si la table existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'ContactMessageUserResponse'
    ) THEN
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
    END IF;
END $$;

-- Supprimer les tables conditionnellement
DO $$ 
BEGIN
    -- Supprimer les tables si elles existent
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'ContactResponse'
    ) THEN
        DROP TABLE "ContactResponse";
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'ContactMessageUserResponse'
    ) THEN
        DROP TABLE "ContactMessageUserResponse";
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'ContactMessage'
    ) THEN
        DROP TABLE "ContactMessage";
    END IF;
END $$;
