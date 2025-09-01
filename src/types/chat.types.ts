export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  author: ChatUser;
  channelId?: string;
  conversationId?: string;
  replyToId?: string;
  replyTo?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  reactions: MessageReaction[];
  mentions: string[];
  attachments?: MessageAttachment[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  user: ChatUser;
  emoji: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  type: 'public' | 'private';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinnedMessages: ChatMessage[];
}

export interface DirectConversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  userId: string;
  user: ChatUser;
  channelId?: string;
  conversationId?: string;
  timestamp: string;
}

export type ChatItemType = 'channel' | 'direct';

export interface ChatListItem {
  id: string;
  type: ChatItemType;
  name: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  participants?: ChatUser[];
  isOnline?: boolean;
  updatedAt: string;
}

export interface ChatState {
  activeItem: ChatListItem | null;
  showDetailSidebar: boolean;
  replyingTo: ChatMessage | null;
  typingUsers: TypingIndicator[];
}