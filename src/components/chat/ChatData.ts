
// Define the structure of the data and make sure it's exporting properly

export interface EmojiData {
  id: string;
  symbol: string;
  name: string;
}

// Export emoji symbols as strings for compatibility
export const emojis: EmojiData[] = [
  { id: "smile", symbol: "😊", name: "Smile" },
  { id: "laugh", symbol: "😂", name: "Laugh" },
  { id: "thumbs_up", symbol: "👍", name: "Thumbs Up" },
  { id: "heart", symbol: "❤️", name: "Heart" },
  { id: "fire", symbol: "🔥", name: "Fire" },
  { id: "clap", symbol: "👏", name: "Clap" },
  { id: "thinking", symbol: "🤔", name: "Thinking" },
  { id: "shock", symbol: "😱", name: "Shock" }
];

// Sample channels for demonstration
export const channels = [
  { id: "1", name: "General", unreadCount: 2 },
  { id: "2", name: "Maintenance", unreadCount: 0 },
  { id: "3", name: "Housekeeping", unreadCount: 5 },
  { id: "4", name: "Villa Caldera", unreadCount: 0 },
  { id: "5", name: "Villa Azure", unreadCount: 0 }
];

// Sample direct messages for demonstration
export const directMessages = [
  { id: "user1", name: "Maria Kowalska", avatar: "/placeholder.svg", online: true, unreadCount: 3 },
  { id: "user2", name: "John Doe", avatar: "/placeholder.svg", online: false, unreadCount: 0 },
  { id: "user3", name: "Alex Smith", avatar: "/placeholder.svg", online: true, unreadCount: 0 },
  { id: "user4", name: "Sara Johnson", avatar: "/placeholder.svg", online: false, unreadCount: 1 }
];

// Sample messages
export const sampleMessages = [
  {
    id: 1,
    sender: "Maria Kowalska",
    avatar: "/placeholder.svg",
    content: "Hi, I need help with Villa Caldera's AC maintenance.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isCurrentUser: false,
    reactions: { "👍": ["John", "Alex"], "❤️": ["Sara"] }
  },
  {
    id: 2,
    sender: "John Doe",
    avatar: "/placeholder.svg",
    content: "I'll check it out. When did it start having problems?",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    isCurrentUser: true,
    reactions: {}
  },
  {
    id: 3,
    sender: "Maria Kowalska",
    avatar: "/placeholder.svg",
    content: "Yesterday evening. Guests complained about it not cooling properly.",
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    isCurrentUser: false,
    reactions: {}
  },
  {
    id: 4,
    sender: "John Doe",
    avatar: "/placeholder.svg",
    content: "I see. I'll bring the necessary tools and check it tomorrow morning.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isCurrentUser: true,
    reactions: { "👍": ["Maria"] }
  },
  {
    id: 5,
    sender: "Maria Kowalska",
    avatar: "/placeholder.svg",
    content: "Thanks for the quick response!",
    timestamp: new Date(Date.now() - 1200000).toISOString(), 
    isCurrentUser: false,
    reactions: {}
  }
];
