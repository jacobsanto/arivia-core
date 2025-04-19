
import { useState } from "react";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";

export function useMessageInput(chatId: string) {
  const [messageInput, setMessageInput] = useState("");
  const { handleTyping, clearTyping } = useTypingIndicator(chatId);

  const handleChangeMessage = (value: string) => {
    setMessageInput(value);
    handleTyping();
  };

  const clearMessageInput = () => {
    setMessageInput("");
    clearTyping();
  };

  return {
    messageInput,
    handleChangeMessage,
    clearMessageInput
  };
}
