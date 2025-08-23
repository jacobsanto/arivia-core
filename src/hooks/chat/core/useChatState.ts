import { useState, useEffect } from 'react';
import { useTeamChat } from '../useTeamChat';

export const useChatState = () => {
  // Use existing team chat hook for now to maintain compatibility
  const teamChatData = useTeamChat();

  // Transform the data to match our new interface
  return {
    // Core state
    activeChat: teamChatData.activeChat,
    activeTab: teamChatData.activeTab,
    sidebarOpen: teamChatData.sidebarOpen,
    
    // Data
    channels: teamChatData.channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      description: (channel as any).description || '',
      memberCount: (channel as any).memberCount || 0,
      unreadCount: (channel as any).unreadCount || 0,
      isPrivate: (channel as any).isPrivate || false
    })),
    directMessages: teamChatData.directMessages.map(dm => ({
      id: dm.id,
      name: dm.name,
      userId: (dm as any).userId || dm.id,
      avatar: dm.avatar,
      unreadCount: (dm as any).unreadCount || 0,
      status: dm.status,
      lastSeen: (dm as any).lastSeen
    })),
    messages: teamChatData.messages,
    messageInput: teamChatData.messageInput,
    
    // Status
    isConnected: teamChatData.isConnected,
    isLoading: teamChatData.loading,
    errors: teamChatData.errors,
    typingUsers: Array.isArray(teamChatData.typingStatus) ? teamChatData.typingStatus : [],
    
    // Connection status
    connectionStatus: teamChatData.isConnected 
      ? 'connected' as const
      : teamChatData.loading 
        ? 'connecting' as const 
        : 'disconnected' as const
  };
};