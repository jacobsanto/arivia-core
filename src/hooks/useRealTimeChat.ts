import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  chatChannelsAPI, 
  directConversationsAPI, 
  chatMessagesAPI, 
  chatUsersAPI,
  typingIndicatorsAPI
} from '@/services/chat/realtime-chat.service';
import {
  ChatChannel,
  DirectConversation,
  ChatMessage,
  ChatUser,
  TypingIndicator,
  ChatListItem
} from '@/types/chat.types';
import { supabase } from '@/integrations/supabase/client';


export const useRealTimeChat = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  // State
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
  const [activeItem, setActiveItem] = useState<ChatListItem | null>(null);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load channels, conversations, and team members in parallel
      const [channelsData, conversationsData, membersData] = await Promise.all([
        chatChannelsAPI.getChannels(),
        directConversationsAPI.getConversations(),
        chatUsersAPI.getTeamMembers()
      ]);
      
      setChannels(channelsData);
      setConversations(conversationsData);
      setTeamMembers(membersData);
      
      // Auto-join public channels if not already a member
      for (const channel of channelsData) {
        if (channel.type === 'public') {
          const isMember = channel.members?.some(member => member.id === user.id);
          if (!isMember) {
            try {
              await chatChannelsAPI.joinChannel(channel.id);
            } catch (error) {
              // Ignore if already a member or other join errors
              console.log('Could not auto-join channel:', channel.name);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast({
        title: "Error",
        description: "Failed to load chat data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Load messages for active item
  const loadMessages = useCallback(async (item: ChatListItem) => {
    try {
      let messagesData: ChatMessage[] = [];
      
      if (item.type === 'channel') {
        messagesData = await chatMessagesAPI.getChannelMessages(item.id);
      } else {
        messagesData = await chatMessagesAPI.getConversationMessages(item.id);
      }
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Convert data to chat list items
  const chatListItems: ChatListItem[] = [
    ...channels.map(channel => ({
      id: channel.id,
      type: 'channel' as const,
      name: `#${channel.name}`,
      lastMessage: undefined, // TODO: Get last message
      unreadCount: channel.unreadCount || 0,
      updatedAt: channel.updatedAt
    })),
    ...conversations.map(conv => {
      const otherParticipant = conv.participants?.find(p => p.id !== user?.id);
      return {
        id: conv.id,
        type: 'direct' as const,
        name: otherParticipant?.name || 'Unknown User',
        lastMessage: undefined, // TODO: Get last message
        unreadCount: conv.unreadCount || 0,
        participants: conv.participants,
        isOnline: otherParticipant?.isOnline,
        updatedAt: conv.updatedAt
      };
    })
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Get active details
  const getActiveDetails = useCallback(() => {
    if (!activeItem) return null;
    
    if (activeItem.type === 'channel') {
      return channels.find(c => c.id === activeItem.id);
    } else {
      return conversations.find(c => c.id === activeItem.id);
    }
  }, [activeItem, channels, conversations]);

  // Send message
  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!activeItem || !user || !content.trim()) return;

    try {
      let newMessage: ChatMessage;
      
      if (activeItem.type === 'channel') {
        newMessage = await chatMessagesAPI.sendChannelMessage(
          activeItem.id, 
          content, 
          replyingTo?.id, 
          attachments
        );
      } else {
        newMessage = await chatMessagesAPI.sendDirectMessage(
          activeItem.id, 
          content, 
          replyingTo?.id, 
          attachments
        );
      }
      
      // Add to local messages
      setMessages(prev => [...prev, newMessage]);
      setReplyingTo(null);
      
      // Stop typing
      await typingIndicatorsAPI.stopTyping();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  }, [activeItem, user, replyingTo, toast]);

  // Add reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      // Check if user already reacted with this emoji
      const message = messages.find(m => m.id === messageId);
      const existingReaction = message?.reactions?.find(r => r.userId === user.id && r.emoji === emoji);
      
      if (existingReaction) {
        await chatMessagesAPI.removeReaction(messageId, emoji);
      } else {
        await chatMessagesAPI.addReaction(messageId, emoji);
      }
      
      // Reload messages to get updated reactions
      if (activeItem) {
        await loadMessages(activeItem);
      }
      
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction.",
        variant: "destructive",
      });
    }
  }, [user, messages, activeItem, loadMessages, toast]);

  // Create channel
  const createChannel = useCallback(async (name: string, description?: string, topic?: string, type: 'public' | 'private' = 'public') => {
    if (!user) return;
    
    try {
      const newChannel = await chatChannelsAPI.createChannel(name, description, topic, type);
      
      // Reload channels to include the new one
      await loadInitialData();
      
      // Auto-join the newly created channel
      await chatChannelsAPI.joinChannel(newChannel.id);
      
      // Set the new channel as active
      const chatListItem: ChatListItem = {
        id: newChannel.id,
        type: 'channel',
        name: `#${newChannel.name}`,
        lastMessage: undefined,
        unreadCount: 0,
        updatedAt: newChannel.updatedAt
      };
      
      setActiveItem(chatListItem);
      await loadMessages(chatListItem);
      
      return newChannel;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, loadInitialData, loadMessages, toast]);

  // Start direct message with user
  const startDirectMessage = useCallback(async (userId: string) => {
    if (!user) return;
    
    try {
      const conversationId = await directConversationsAPI.getOrCreateConversation(userId);
      
      // Reload conversations to include the new one
      const conversationsData = await directConversationsAPI.getConversations();
      setConversations(conversationsData);
      
      // Find and set the conversation as active
      const conversation = conversationsData.find(c => c.id === conversationId);
      if (conversation) {
        const otherParticipant = conversation.participants?.find(p => p.id !== user.id);
        const chatListItem: ChatListItem = {
          id: conversation.id,
          type: 'direct',
          name: otherParticipant?.name || 'Unknown User',
          lastMessage: undefined,
          unreadCount: conversation.unreadCount || 0,
          participants: conversation.participants,
          isOnline: otherParticipant?.isOnline,
          updatedAt: conversation.updatedAt
        };
        
        setActiveItem(chatListItem);
        await loadMessages(chatListItem);
      }
      
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start direct message.",
        variant: "destructive",
      });
    }
  }, [user, loadMessages, toast]);

  // Start typing
  const startTyping = useCallback(async () => {
    if (!activeItem) return;
    
    try {
      await typingIndicatorsAPI.startTyping(
        activeItem.type === 'channel' ? activeItem.id : undefined,
        activeItem.type === 'direct' ? activeItem.id : undefined
      );
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  }, [activeItem]);

  // Stop typing
  const stopTyping = useCallback(async () => {
    try {
      await typingIndicatorsAPI.stopTyping();
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  }, []);

  // Handle active item change
  const handleSetActiveItem = useCallback(async (item: ChatListItem) => {
    setActiveItem(item);
    await loadMessages(item);
    setReplyingTo(null);
  }, [loadMessages]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const subscriptions: any[] = [];

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          console.log('New message:', payload);
          // TODO: Handle new message
        }
      )
      .subscribe();

    subscriptions.push(messagesSubscription);

    // Subscribe to reactions
    const reactionsSubscription = supabase
      .channel('message_reactions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        (payload) => {
          console.log('Reaction change:', payload);
          // TODO: Handle reaction changes
        }
      )
      .subscribe();

    subscriptions.push(reactionsSubscription);

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user]);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    // Data
    chatListItems,
    activeMessages: messages,
    activeDetails: getActiveDetails(),
    typingUsers: typingUsers.filter(t => 
      (activeItem?.type === 'channel' && t.channelId === activeItem.id) ||
      (activeItem?.type === 'direct' && t.conversationId === activeItem.id)
    ),
    teamMembers,
    
    // State
    activeItem,
    showDetailSidebar,
    replyingTo,
    isLoading,
    
    // Actions
    setActiveItem: handleSetActiveItem,
    setShowDetailSidebar,
    setReplyingTo,
    sendMessage,
    addReaction,
    createChannel,
    startDirectMessage,
    startTyping,
    stopTyping,
    
    // Utilities
    loadInitialData
  };
};