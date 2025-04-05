
export interface MessageReaction {
  [emoji: string]: string[];
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: MessageReaction;
}
