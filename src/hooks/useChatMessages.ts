import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

export interface MessageReaction {
  [emoji: string]: string[];
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: MessageReaction;
}

export const useChatMessages = (activeChat: string) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [typingTimeout, setTypingTimeoutState] = useState<NodeJS.Timeout | null>(null);
  const [reactionMessageId, setReactionMessageId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const storedMessages = localStorage.getItem(`chat_${activeChat}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(sampleMessages);
    }
  }, [activeChat]);

  useEffect(() => {
    localStorage.setItem(`chat_${activeChat}`, JSON.stringify(messages));
  }, [messages, activeChat]);

  const handleTyping = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setTypingStatus("typing...");
    
    const timeout = setTimeout(() => {
      setTypingStatus("");
    }, 3000);
    
    setTypingTimeoutState(timeout);
  };

  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: user?.name || "Admin",
        avatar: user?.avatar || "/placeholder.svg",
        content: message.trim(),
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        reactions: {} // Initialize empty reactions object
      };
      
      setMessages([...messages, newMessage]);
      setMessage("");
      setTypingStatus("");
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      toast({
        title: "Message sent",
        description: `Your message was sent to ${activeChat}`,
      });
    }
  };
  
  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          if (msg.isCurrentUser) {
            return msg;
          }
          
          const reactions = msg.reactions || {};
          const userList = reactions[emoji] || [];
          
          const username = user?.name || "Admin";
          const hasReacted = userList.includes(username);
          
          const updatedReactions = {
            ...reactions,
            [emoji]: hasReacted 
              ? userList.filter(name => name !== username) 
              : [...userList, username]
          };

          const finalReactions = Object.fromEntries(
            Object.entries(updatedReactions).filter(([_, users]) => users.length > 0)
          );
          
          return {
            ...msg,
            reactions: finalReactions
          };
        }
        return msg;
      })
    );
    
    setShowEmojiPicker(false);
    setReactionMessageId(null);
  };

  const sampleMessages = [
    {
      id: 1,
      sender: "Maria Kowalska",
      avatar: "/placeholder.svg",
      content: "I just finished cleaning Villa Caldera. All tasks completed and photos uploaded.",
      timestamp: "2025-04-04T09:32:00",
      isCurrentUser: false,
      reactions: {}
    },
    {
      id: 2,
      sender: "Admin",
      avatar: "/placeholder.svg",
      content: "Great job! Did you also check if all amenities were restocked?",
      timestamp: "2025-04-04T09:35:00",
      isCurrentUser: true,
      reactions: {}
    },
    {
      id: 3,
      sender: "Maria Kowalska",
      avatar: "/placeholder.svg",
      content: "Yes, I restocked everything according to the inventory list. There were some items running low though. We should order more bathroom supplies soon.",
      timestamp: "2025-04-04T09:38:00",
      isCurrentUser: false,
      reactions: {}
    },
    {
      id: 4,
      sender: "Admin",
      avatar: "/placeholder.svg",
      content: "I'll create a purchase order right away. Thanks for flagging this!",
      timestamp: "2025-04-04T09:40:00",
      isCurrentUser: true,
      reactions: {}
    },
    {
      id: 5,
      sender: "Maria Kowalska",
      avatar: "/placeholder.svg",
      content: "No problem! Also, I noticed a small issue with the shower in the master bathroom. The water pressure seems a bit low. Should I create a maintenance task?",
      timestamp: "2025-04-04T09:43:00",
      isCurrentUser: false,
      reactions: {}
    },
  ];

  return {
    messages,
    message,
    setMessage,
    typingStatus,
    handleChangeMessage,
    handleSendMessage,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker,
    setShowEmojiPicker,
    addReaction
  };
};
