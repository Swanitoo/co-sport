-- Ensure the User table has the correct default for id
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Drop existing constraints if they exist
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_productId_fkey'
    ) THEN
        ALTER TABLE "messages" DROP CONSTRAINT "messages_productId_fkey";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_userId_fkey'
    ) THEN
        ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";
    END IF;
END $$;

-- Add the correct constraints
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_product_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_product_fkey"
            FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_user_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_user_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
    END IF;
END $$; 