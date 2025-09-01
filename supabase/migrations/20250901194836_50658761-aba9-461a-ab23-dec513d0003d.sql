-- Create chat channels table
CREATE TABLE public.chat_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    topic text,
    type text NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private')),
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Create direct conversations table
CREATE TABLE public.direct_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 uuid NOT NULL,
    participant_2 uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_message_at timestamp with time zone,
    UNIQUE(participant_1, participant_2),
    CHECK (participant_1 != participant_2)
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL,
    author_id uuid NOT NULL,
    channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    conversation_id uuid REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
    reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    edited_at timestamp with time zone,
    mentions uuid[],
    attachments jsonb DEFAULT '[]'::jsonb,
    CHECK (
        (channel_id IS NOT NULL AND conversation_id IS NULL) OR 
        (channel_id IS NULL AND conversation_id IS NOT NULL)
    )
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    emoji text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(message_id, user_id, emoji)
);

-- Create channel members table
CREATE TABLE public.channel_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at timestamp with time zone DEFAULT now(),
    last_read_at timestamp with time zone DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- Create typing indicators table
CREATE TABLE public.typing_indicators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    conversation_id uuid REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
    started_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + interval '10 seconds'),
    CHECK (
        (channel_id IS NOT NULL AND conversation_id IS NULL) OR 
        (channel_id IS NULL AND conversation_id IS NOT NULL)
    )
);

-- Enable RLS on all tables
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_channels
CREATE POLICY "View public channels" ON public.chat_channels
    FOR SELECT USING (type = 'public' OR id IN (
        SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Create channels (authenticated)" ON public.chat_channels
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Update own channels or admins" ON public.chat_channels
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        has_role(auth.uid(), 'administrator'::app_role) OR
        id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid() AND role = 'admin')
    );

-- RLS Policies for direct_conversations
CREATE POLICY "View own conversations" ON public.direct_conversations
    FOR SELECT USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Create conversations (authenticated)" ON public.direct_conversations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        (participant_1 = auth.uid() OR participant_2 = auth.uid())
    );

CREATE POLICY "Update own conversations" ON public.direct_conversations
    FOR UPDATE USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "View channel messages" ON public.chat_messages
    FOR SELECT USING (
        (channel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.chat_channels 
            WHERE id = channel_id AND (
                type = 'public' OR 
                id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid())
            )
        )) OR
        (conversation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.direct_conversations 
            WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
        ))
    );

CREATE POLICY "Create messages (authenticated)" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND author_id = auth.uid() AND
        (
            (channel_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.channel_members 
                WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()
            )) OR
            (conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.direct_conversations 
                WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
            ))
        )
    );

CREATE POLICY "Update own messages" ON public.chat_messages
    FOR UPDATE USING (author_id = auth.uid());

-- RLS Policies for message_reactions
CREATE POLICY "View reactions" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_messages 
            WHERE id = message_id AND (
                (channel_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.chat_channels 
                    WHERE id = channel_id AND (
                        type = 'public' OR 
                        id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid())
                    )
                )) OR
                (conversation_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.direct_conversations 
                    WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
                ))
            )
        )
    );

CREATE POLICY "Create reactions (authenticated)" ON public.message_reactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Delete own reactions" ON public.message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for channel_members
CREATE POLICY "View channel members" ON public.channel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_channels 
            WHERE id = channel_id AND (
                type = 'public' OR 
                id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Join channels (authenticated)" ON public.channel_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND user_id = auth.uid() AND
        EXISTS (SELECT 1 FROM public.chat_channels WHERE id = channel_id AND type = 'public')
    );

CREATE POLICY "Leave channels" ON public.channel_members
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "View typing indicators" ON public.typing_indicators
    FOR SELECT USING (
        (channel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.channel_members 
            WHERE channel_id = typing_indicators.channel_id AND user_id = auth.uid()
        )) OR
        (conversation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.direct_conversations 
            WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
        ))
    );

CREATE POLICY "Create typing indicators (authenticated)" ON public.typing_indicators
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Delete own typing indicators" ON public.typing_indicators
    FOR DELETE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_chat_messages_channel_id ON public.chat_messages(channel_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_chat_messages_author_id ON public.chat_messages(author_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON public.channel_members(user_id);
CREATE INDEX idx_direct_conversations_participants ON public.direct_conversations(participant_1, participant_2);
CREATE INDEX idx_typing_indicators_expires_at ON public.typing_indicators(expires_at);

-- Function to get or create direct conversation
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
    user1_id uuid,
    user2_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_id uuid;
BEGIN
    -- Try to find existing conversation (either direction)
    SELECT id INTO conversation_id
    FROM public.direct_conversations
    WHERE (participant_1 = user1_id AND participant_2 = user2_id)
       OR (participant_1 = user2_id AND participant_2 = user1_id);
    
    -- If not found, create new conversation
    IF conversation_id IS NULL THEN
        INSERT INTO public.direct_conversations (participant_1, participant_2)
        VALUES (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$$;

-- Function to update last message timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE public.direct_conversations
        SET last_message_at = NEW.created_at,
            updated_at = NEW.created_at
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger to update conversation timestamp
CREATE TRIGGER update_conversation_timestamp_trigger
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_timestamp();

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing_indicators()
RETURNS void
LANGUAGE sql
AS $$
    DELETE FROM public.typing_indicators WHERE expires_at < now();
$$;

-- Insert default channels
INSERT INTO public.chat_channels (name, description, topic, type, created_by) 
VALUES 
    ('general', 'General team discussions', 'Welcome to Arivia Core! Use this channel for general team discussions.', 'public', (SELECT id FROM auth.users LIMIT 1)),
    ('maintenance-sos', 'Emergency maintenance issues', 'For urgent maintenance issues that need immediate attention', 'public', (SELECT id FROM auth.users LIMIT 1)),
    ('housekeeping', 'Daily housekeeping coordination', 'Daily coordination for housekeeping tasks and schedules', 'public', (SELECT id FROM auth.users LIMIT 1));