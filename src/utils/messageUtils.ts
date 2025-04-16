
import { Message, MessageReaction } from "@/hooks/useChatTypes";

// Sample messages for initial chat state
export const getSampleMessages = (): Message[] => [
  {
    id: "1",
    sender: "Maria Kowalska",
    avatar: "/placeholder.svg",
    content: "I just finished cleaning Villa Caldera. All tasks completed and photos uploaded.",
    timestamp: "2025-04-04T09:32:00",
    isCurrentUser: false,
    reactions: {}
  },
  {
    id: "2",
    sender: "Admin",
    avatar: "/placeholder.svg",
    content: "Great job! Did you also check if all amenities were restocked?",
    timestamp: "2025-04-04T09:35:00",
    isCurrentUser: true,
    reactions: {}
  },
  {
    id: "3",
    sender: "Maria Kowalska",
    avatar: "/placeholder.svg",
    content: "Yes, I restocked everything according to the inventory list. There were some items running low though. We should order more bathroom supplies soon.",
    timestamp: "2025-04-04T09:38:00",
    isCurrentUser: false,
    reactions: {}
  },
  {
    id: "4",
    sender: "Admin",
    avatar: "/placeholder.svg",
    content: "I'll create a purchase order right away. Thanks for flagging this!",
    timestamp: "2025-04-04T09:40:00",
    isCurrentUser: true,
    reactions: {}
  },
  {
    id: "5",
    sender: "Maria Kowalska",
    avatar: "/placeholder.svg",
    content: "No problem! Also, I noticed a small issue with the shower in the master bathroom. The water pressure seems a bit low. Should I create a maintenance task?",
    timestamp: "2025-04-04T09:43:00",
    isCurrentUser: false,
    reactions: {}
  },
];
