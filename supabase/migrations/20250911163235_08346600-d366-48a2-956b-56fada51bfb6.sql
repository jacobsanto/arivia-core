-- First, verify the profiles table structure
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS fk_chat_messages_author_id;

-- Add the foreign key constraint explicitly referencing user_id in profiles table  
-- Note: We need to ensure author_id references user_id (not id) in profiles table
ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_author_profiles 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Also ensure that profiles.user_id has a unique constraint (should be primary key or unique)
-- Let's check what constraints exist on profiles table
-- This query will help us understand the profiles table structure