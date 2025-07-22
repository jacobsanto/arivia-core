
import { Message } from "../../useChatTypes";

export function getErrorMessages(): Message[] {
  return [{
    id: 'error-message',
    sender: 'System',
    avatar: '/placeholder.svg',
    content: 'Unable to load messages. Please check your connection and try again.',
    timestamp: new Date().toISOString(),
    isCurrentUser: false,
    reactions: {},
    attachments: []
  }];
}
