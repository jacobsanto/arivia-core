
import React from "react";
import { Circle } from "lucide-react";

interface TypingIndicatorProps {
  typingStatus: string;
  activeChat: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingStatus, activeChat }) => {
  if (!typingStatus) return null;
  
  return (
    <div className="flex items-center text-sm text-muted-foreground mt-2">
      <div className="flex space-x-1 items-center">
        <Circle className="h-2 w-2 animate-pulse" />
        <Circle className="h-2 w-2 animate-pulse delay-100" />
        <Circle className="h-2 w-2 animate-pulse delay-200" />
      </div>
      <span className="ml-2">{typingStatus}</span>
    </div>
  );
};

export default TypingIndicator;
