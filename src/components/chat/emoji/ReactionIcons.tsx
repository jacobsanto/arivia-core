
import React from "react";
import { ThumbsUp, Heart, Waves, PartyPopper, HandMetal } from "lucide-react";

// Map emoji characters to minimal Lucide icons with consistent styling
export const getReactionIcon = (emoji: string) => {
  switch (emoji) {
    case "👍": return <ThumbsUp className="w-3 h-3 stroke-[1.5]" />;
    case "❤️": return <Heart className="w-3 h-3 stroke-[1.5]" />;
    case "😂": return <ThumbsUp className="w-3 h-3 stroke-[1.5] rotate-180" />; // Using thumbs up rotated as a stand-in
    case "🎉": return <PartyPopper className="w-3 h-3 stroke-[1.5]" />;
    case "👋": return <Waves className="w-3 h-3 stroke-[1.5]" />;
    case "🙏": return <HandMetal className="w-3 h-3 stroke-[1.5]" />; // Using as alternative
    default: return emoji;
  }
};
