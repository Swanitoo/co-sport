-- First, ensure we have the basic foreign key constraints
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