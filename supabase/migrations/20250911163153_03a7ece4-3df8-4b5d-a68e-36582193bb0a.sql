-- Check if the constraint already exists with a different name
DO $$
BEGIN
    -- Try to add the foreign key constraint
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'chat_messages'
        AND table_schema = 'public'
        AND constraint_name = 'fk_chat_messages_author_id'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT fk_chat_messages_author_id 
        FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding foreign key: %', SQLERRM;
END $$;