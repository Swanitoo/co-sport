-- This is an empty migration.

-- Cette migration corrige les relations de messages de manière idempotente
-- Elle vérifie l'état actuel de la base de données avant d'appliquer des changements

-- 1. Vérifier si la colonne isDeleted existe dans la table messages, sinon l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'isDeleted'
    ) THEN
        ALTER TABLE "messages" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 2. Vérifier et corriger les contraintes de clé étrangère pour les messages
DO $$
BEGIN
    -- Messages User FK - vérifier si la contrainte messages_user_fkey existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'messages_user_fkey' 
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Si elle n'existe pas, vérifier si l'ancienne contrainte existe et la supprimer
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'messages_userId_fkey' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";
        END IF;
        
        -- Ajouter la nouvelle contrainte
        ALTER TABLE "messages" ADD CONSTRAINT "messages_user_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Messages Product FK - vérifier si la contrainte messages_product_fkey existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'messages_product_fkey' 
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Si elle n'existe pas, vérifier si l'ancienne contrainte existe et la supprimer
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'messages_productId_fkey' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            ALTER TABLE "messages" DROP CONSTRAINT "messages_productId_fkey";
        END IF;
        
        -- Ajouter la nouvelle contrainte
        ALTER TABLE "messages" ADD CONSTRAINT "messages_product_fkey" 
            FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 3. Vérifier la colonne userId dans Review et l'ajouter si nécessaire
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Review' AND column_name = 'userId'
    ) THEN
        -- Nous devons trouver un userID par défaut car la colonne ne peut pas être NULL
        -- Dans un environnement de production, une stratégie plus sophistiquée serait nécessaire
        ALTER TABLE "Review" ADD COLUMN "userId" TEXT NOT NULL DEFAULT (
            SELECT id FROM "User" ORDER BY "createdAt" LIMIT 1
        );
        
        -- Vérifier si la contrainte n'existe pas déjà avant de l'ajouter
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'Review_userId_fkey' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            -- Ajouter la contrainte de clé étrangère pour userId
            ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" 
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;