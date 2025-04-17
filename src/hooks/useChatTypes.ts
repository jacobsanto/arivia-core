
export interface MessageReaction {
  [emoji: string]: string[];
}

export interface Message {
  id: string; 
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: MessageReaction;
  error?: boolean;
  errorMessage?: string;
}
