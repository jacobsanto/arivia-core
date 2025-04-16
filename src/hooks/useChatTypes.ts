
export interface MessageReaction {
  [emoji: string]: string[];
}

export interface Message {
  id: string; // Changed from number to string to match the database
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: MessageReaction;
}
