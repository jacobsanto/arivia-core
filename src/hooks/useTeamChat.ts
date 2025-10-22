import { useState, useEffect, useCallback } from 'react';
import { ChatChannel, DirectConversation, ChatMessage, ChatListItem, ChatUser, TypingIndicator } from '@/types/chat.types';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

export const useTeamChat = () => {
  const { user } = useUser();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeItem, setActiveItem] = useState<ChatListItem | null>(null);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load channels
  const loadChannels = useCallback(async () => {
    if (!user) return;

    try {
      // @ts-ignore - Avoid deep instantiation error
      const result = await supabase
        .from('chat_channels')
        .select('*')
        .eq('is_active', true);

      if (result.error) throw result.error;

      const channelsWithMembers = (result.data || []).map(channel => ({
        ...channel,
        members: [], // Channel members functionality
        unreadCount: 0, // Unread count functionality
        pinnedMessages: [],
        createdBy: channel.created_by,
        createdAt: channel.created_at,
        updatedAt: channel.updated_at
      })) as ChatChannel[];

      setChannels(channelsWithMembers);
    } catch (error) {
      console.error('Failed to load channels:', error);
      toast({
        title: "Error",
        description: "Failed to load chat channels",
        variant: "destructive"
      });
    }
  }, [user]);

  // Load messages for active chat
  const loadMessages = useCallback(async () => {
    if (!activeItem || !user) return;

    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (activeItem.type === 'channel') {
        query = query.eq('channel_id', activeItem.id);
      } else {
        query = query.eq('conversation_id', activeItem.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const chatMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        authorId: msg.author_id,
        author: {
          id: msg.author_id,
          name: 'User Name', // Author relationship needed
          email: 'user@example.com',
          role: 'staff',
          isOnline: true,
          avatar: '/placeholder.svg'
        },
        channelId: msg.channel_id,
        conversationId: msg.conversation_id,
        replyToId: msg.reply_to_id,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        reactions: [],
        mentions: []
      }));

      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error", 
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [activeItem, user]);

  // Send a message
  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!activeItem || !user || !content.trim()) return;

    try {
      const messageData = {
        content: content.trim(),
        author_id: user.id,
        channel_id: activeItem.type === 'channel' ? activeItem.id : null,
        conversation_id: activeItem.type === 'direct' ? activeItem.id : null,
        reply_to_id: replyingTo?.id || null
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) throw error;

      setReplyingTo(null);
      
      // Reload messages to get the new one
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [activeItem, user, replyingTo, loadMessages]);

  // Add reaction to message
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if reaction already exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji
          });
      }

      // Reload messages to update reactions
      await loadMessages();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [user, loadMessages]);

  // Convert channels and conversations to chat list items
  const chatListItems: ChatListItem[] = [
    ...channels.map(channel => ({
      id: channel.id,
      type: 'channel' as const,
      name: `#${channel.name}`,
      lastMessage: messages.filter(m => m.channelId === channel.id).pop(),
      unreadCount: channel.unreadCount,
      updatedAt: channel.updatedAt
    })),
    ...conversations.map(conv => {
      const otherUser = conv.participants.find(p => p.id !== user?.id);
      return {
        id: conv.id,
        type: 'direct' as const,
        name: otherUser?.name || 'Unknown User',
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
        participants: conv.participants,
        isOnline: otherUser?.isOnline,
        updatedAt: conv.updatedAt
      };
    })
  ];

  // Get messages for active conversation
  const getActiveMessages = useCallback(() => {
    if (!activeItem) return [];
    
    if (activeItem.type === 'channel') {
      return messages.filter(m => m.channelId === activeItem.id);
    } else {
      return messages.filter(m => m.conversationId === activeItem.id);
    }
  }, [activeItem, messages]);

  // Get active channel or conversation details
  const getActiveDetails = useCallback(() => {
    if (!activeItem) return null;
    
    if (activeItem.type === 'channel') {
      return channels.find(c => c.id === activeItem.id);
    } else {
      return conversations.find(c => c.id === activeItem.id);
    }
  }, [activeItem, channels, conversations]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          // Reload messages when new ones are inserted
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user, loadMessages]);

  // Load initial data
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([loadChannels()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user, loadChannels]);

  // Load messages when active item changes
  useEffect(() => {
    if (activeItem) {
      loadMessages();
    }
  }, [activeItem, loadMessages]);

  return {
    // Data
    chatListItems: chatListItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    activeMessages: getActiveMessages(),
    activeDetails: getActiveDetails(),
    typingUsers: typingUsers.filter(t => 
      (activeItem?.type === 'channel' && t.channelId === activeItem.id) ||
      (activeItem?.type === 'direct' && t.conversationId === activeItem.id)
    ),
    
    // State
    activeItem,
    showDetailSidebar,
    replyingTo,
    isLoading,
    
    // Actions
    setActiveItem,
    setShowDetailSidebar,
    setReplyingTo,
    sendMessage,
    addReaction,
    startTyping: () => {
      // Typing indicator functionality placeholder
      console.log('Start typing indicator');
    },
    stopTyping: () => {
      // Stop typing indicator functionality placeholder
      console.log('Stop typing indicator');
    }
  };
};
