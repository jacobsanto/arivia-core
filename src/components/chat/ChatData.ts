
// Placeholder for chat data until we fully implement the database

export const channels = [];
export const messages = [];
export const directMessages = [];

// Emoji data for reactions
export interface EmojiData {
  id: string;
  symbol: string;
  name: string;
}

export const emojis: EmojiData[] = [
  { id: "emoji-1", symbol: "👍", name: "thumbs up" },
  { id: "emoji-2", symbol: "❤️", name: "heart" },
  { id: "emoji-3", symbol: "😊", name: "smile" },
  { id: "emoji-4", symbol: "🎉", name: "party" },
  { id: "emoji-5", symbol: "👏", name: "clap" }
];
