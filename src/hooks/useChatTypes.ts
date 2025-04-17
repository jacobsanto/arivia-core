
export interface MessageReaction {
  [emoji: string]: string[];
}

export interface MessageAttachment {
  id: string;
  type: string;
  url: string;
  name: string;
}

export interface Message {
  id: string; 
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: MessageReaction;
  attachments?: MessageAttachment[];
  error?: boolean;
  errorMessage?: string;
}
