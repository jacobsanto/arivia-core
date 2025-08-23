
import React from "react";
import { ChatContainer } from "@/components/chat/core/ChatContainer";
import { TeamChatErrorBoundary } from "@/components/error-boundaries/TeamChatErrorBoundary";

const TeamChat: React.FC = () => {
  return (
    <TeamChatErrorBoundary>
      <ChatContainer />
    </TeamChatErrorBoundary>
  );
};

export default TeamChat;
