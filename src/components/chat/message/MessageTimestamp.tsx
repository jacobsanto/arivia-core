
import React from "react";

interface MessageTimestampProps {
  timestamp: string;
  isCurrentUser: boolean;
}

const MessageTimestamp: React.FC<MessageTimestampProps> = ({ timestamp, isCurrentUser }) => {
  return (
    <div
      className={`flex text-xs text-muted-foreground mt-1 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <span>
        {new Date(timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

export default MessageTimestamp;
