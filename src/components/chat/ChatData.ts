
// Sample chat data
export const channels = [
  { id: 1, name: "General" },
  { id: 2, name: "Housekeeping" },
  { id: 3, name: "Maintenance" },
  { id: 4, name: "Villa Caldera" },
  { id: 5, name: "Villa Azure" },
  { id: 6, name: "Villa Sunset" },
];

export const directMessages = [
  { id: 1, name: "Maria Kowalska", avatar: "/placeholder.svg", status: "online" as const, unreadCount: 2 },
  { id: 2, name: "Alex Chen", avatar: "/placeholder.svg", status: "offline" as const, unreadCount: 0 },
  { id: 3, name: "Stefan Müller", avatar: "/placeholder.svg", status: "online" as const, unreadCount: 0 },
  { id: 4, name: "Sophia Rodriguez", avatar: "/placeholder.svg", status: "away" as const, unreadCount: 5 },
];

// Using emojis that correspond to Lucide icons
export const emojis = ["👍", "❤️", "😂", "🎉", "👋", "🙏"];
