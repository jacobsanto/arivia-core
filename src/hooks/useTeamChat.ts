import { useState, useEffect, useCallback } from 'react';
import { ChatChannel, DirectConversation, ChatMessage, ChatListItem, ChatUser, TypingIndicator } from '@/types/chat.types';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

// Mock data for development
const mockUsers: ChatUser[] = [
  {
    id: '1',
    name: 'Elena Papadopoulos',
    email: 'elena@arivia.com',
    role: 'Operations Manager',
    isOnline: true,
    avatar: undefined
  },
  {
    id: '2', 
    name: 'Nikos Stavros',
    email: 'nikos@arivia.com',
    role: 'Maintenance Technician',
    isOnline: true,
    avatar: undefined
  },
  {
    id: '3',
    name: 'Maria Georgiou',
    email: 'maria@arivia.com', 
    role: 'Housekeeping Supervisor',
    isOnline: false,
    lastSeen: '2024-01-15T10:30:00Z',
    avatar: undefined
  },
  {
    id: '4',
    name: 'Dimitris Kostas',
    email: 'dimitris@arivia.com',
    role: 'Property Manager',
    isOnline: true,
    avatar: undefined
  }
];

const mockChannels: ChatChannel[] = [
  {
    id: 'general',
    name: 'general',
    description: 'General team discussions',
    topic: 'Welcome to Arivia Core! Use this channel for general team discussions.',
    type: 'public',
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    members: mockUsers,
    unreadCount: 0,
    pinnedMessages: []
  },
  {
    id: 'maintenance-sos',
    name: 'maintenance-sos',
    description: 'Emergency maintenance issues',
    topic: 'For urgent maintenance issues that need immediate attention',
    type: 'public',
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T15:45:00Z',
    members: mockUsers.filter(u => ['1', '2', '4'].includes(u.id)),
    unreadCount: 3,
    pinnedMessages: []
  },
  {
    id: 'housekeeping',
    name: 'housekeeping',
    description: 'Daily housekeeping coordination',
    topic: 'Daily coordination for housekeeping tasks and schedules',
    type: 'public',
    createdBy: '3',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:15:00Z',
    members: mockUsers.filter(u => ['1', '3', '4'].includes(u.id)),
    unreadCount: 1,
    pinnedMessages: []
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Good morning team! Hope everyone is ready for another great day at Arivia.',
    authorId: '1',
    author: mockUsers[0],
    channelId: 'general',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    reactions: [
      {
        id: 'r1',
        messageId: '1',
        userId: '2',
        user: mockUsers[1],
        emoji: '👋',
        createdAt: '2024-01-15T08:01:00Z'
      }
    ],
    mentions: []
  },
  {
    id: '2',
    content: 'URGENT: Pool pump at Villa Eros is making strange noises. @Nikos can you check this ASAP?',
    authorId: '1',
    author: mockUsers[0],
    channelId: 'maintenance-sos',
    createdAt: '2024-01-15T15:45:00Z',
    updatedAt: '2024-01-15T15:45:00Z',
    reactions: [],
    mentions: ['2']
  },
  {
    id: '3',
    content: 'On my way! Should be there in 15 minutes.',
    authorId: '2',
    author: mockUsers[1],
    channelId: 'maintenance-sos',
    replyToId: '2',
    createdAt: '2024-01-15T15:47:00Z',
    updatedAt: '2024-01-15T15:47:00Z',
    reactions: [
      {
        id: 'r2',
        messageId: '3',
        userId: '1',
        user: mockUsers[0],
        emoji: '👍',
        createdAt: '2024-01-15T15:48:00Z'
      }
    ],
    mentions: []
  }
];

export const useTeamChat = () => {
  const { user } = useUser();
  const [channels, setChannels] = useState<ChatChannel[]>(mockChannels);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [activeItem, setActiveItem] = useState<ChatListItem | null>(null);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Send a message
  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!activeItem || !user) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content,
      authorId: user.id,
      author: {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        isOnline: true
      },
      channelId: activeItem.type === 'channel' ? activeItem.id : undefined,
      conversationId: activeItem.type === 'direct' ? activeItem.id : undefined,
      replyToId: replyingTo?.id,
      replyTo: replyingTo || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: [],
      mentions: [],
      attachments: attachments?.map(att => ({
        id: att.id,
        messageId: newMessage.id,
        fileName: att.name,
        fileUrl: att.url,
        fileType: att.type,
        fileSize: att.size,
        createdAt: new Date().toISOString()
      }))
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
  }, [activeItem, user, replyingTo]);

  // Add reaction to message
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.userId === user.id && r.emoji === emoji);
        
        if (existingReaction) {
          // Remove reaction
          return {
            ...msg,
            reactions: msg.reactions.filter(r => r.id !== existingReaction.id)
          };
        } else {
          // Add reaction
          const newReaction = {
            id: `reaction_${Date.now()}`,
            messageId,
            userId: user.id,
            user: {
              id: user.id,
              name: user.name || user.email,
              email: user.email,
              role: user.role,
              isOnline: true
            },
            emoji,
            createdAt: new Date().toISOString()
          };
          
          return {
            ...msg,
            reactions: [...msg.reactions, newReaction]
          };
        }
      }
      return msg;
    }));
  }, [user]);

  // Start typing indicator
  const startTyping = useCallback(async () => {
    if (!activeItem || !user) return;
    
    // Implementation for typing indicator
  }, [activeItem, user]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!activeItem || !user) return;
    
    // Implementation for typing indicator
  }, [activeItem, user]);

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
    startTyping,
    stopTyping
  };
};