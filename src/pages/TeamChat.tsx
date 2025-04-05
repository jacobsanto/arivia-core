
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Paperclip, 
  Send, 
  Menu, 
  X, 
  Smile,
  Image,
  ChevronRight,
  Circle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

// Sample chat data
const channels = [
  { id: 1, name: "General" },
  { id: 2, name: "Housekeeping" },
  { id: 3, name: "Maintenance" },
  { id: 4, name: "Villa Caldera" },
  { id: 5, name: "Villa Azure" },
  { id: 6, name: "Villa Sunset" },
];

const directMessages = [
  { id: 1, name: "Maria Kowalska", avatar: "/placeholder.svg", status: "online", unreadCount: 2 },
  { id: 2, name: "Alex Chen", avatar: "/placeholder.svg", status: "offline", unreadCount: 0 },
  { id: 3, name: "Stefan Müller", avatar: "/placeholder.svg", status: "online", unreadCount: 0 },
  { id: 4, name: "Sophia Rodriguez", avatar: "/placeholder.svg", status: "away", unreadCount: 5 },
];

// Message type definition
interface Message {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: { [emoji: string]: string[] };
}

const emojis = ["👍", "❤️", "😂", "🎉", "👋", "🙏"];

const TeamChat = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState("Maria Kowalska");
  const [activeTab, setActiveTab] = useState("direct");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");
  const [typingTimeout, setTypingTimeoutState] = useState<NodeJS.Timeout | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState<number | null>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(`chat_${activeChat}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      // If no stored messages, use sample messages
      setMessages(sampleMessages);
    }
  }, [activeChat]);

  // Save messages to localStorage when messages change
  useEffect(() => {
    localStorage.setItem(`chat_${activeChat}`, JSON.stringify(messages));
  }, [messages, activeChat]);

  // Sample messages as fallback
  const sampleMessages = [
    {
      id: 1,
      sender: "Maria Kowalska",
      avatar: "/placeholder.svg",
      content: "I just finished cleaning Villa Caldera. All tasks completed and photos uploaded.",
      timestamp: "2025-04-04T09:32:00",
      isCurrentUser: false,
    },
    {
      id: 2,
      sender: "Admin",
      avatar: "/placeholder.svg",
      content: "Great job! Did you also check if all amenities were restocked?",
      timestamp: "2025-04-04T09:35:00",
      isCurrentUser: true,
    },
    {
      id: 3,
      sender: "Maria Kowalska",
      avatar: "/placeholder.svg",
      content: "Yes, I restocked everything according to the inventory list. There were some items running low though. We should order more bathroom supplies soon.",
      timestamp: "2025-04-04T09:38:00",
      isCurrentUser: false,
    },
    {
      id: 4,
      sender: "Admin",
      avatar: "/placeholder.svg",
      content: "I'll create a purchase order right away. Thanks for flagging this!",
      timestamp: "2025-04-04T09:40:00",
      isCurrentUser: true,
    },
    {
      id: 5,
      sender: "Maria Kowalska",
      avatar: "/placeholder.svg",
      content: "No problem! Also, I noticed a small issue with the shower in the master bathroom. The water pressure seems a bit low. Should I create a maintenance task?",
      timestamp: "2025-04-04T09:43:00",
      isCurrentUser: false,
    },
  ];

  // Handle typing indicator
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
      };
      
      setMessages([...messages, newMessage]);
      setMessage("");
      setTypingStatus("");
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Mark unread messages as read
      const updatedDirectMessages = directMessages.map(dm => {
        if (dm.name === activeChat) {
          return { ...dm, unreadCount: 0 };
        }
        return dm;
      });
      
      // Show notification for sent message
      toast({
        title: "Message sent",
        description: `Your message was sent to ${activeChat}`,
      });
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          const userList = reactions[emoji] || [];
          
          // Toggle user's reaction
          const username = user?.name || "Admin";
          const hasReacted = userList.includes(username);
          
          return {
            ...msg,
            reactions: {
              ...reactions,
              [emoji]: hasReacted 
                ? userList.filter(name => name !== username) 
                : [...userList, username]
            }
          };
        }
        return msg;
      })
    );
    
    setReactionMessageId(null);
    setShowEmojiPicker(false);
  };
  
  const handleSelectChat = (chatName: string) => {
    setActiveChat(chatName);
    
    // Close sidebar on mobile after selecting chat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
        <p className="text-muted-foreground">
          Communicate in real-time with your team members.
        </p>
      </div>
      
      <div className="flex flex-1 gap-4 h-full">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden absolute top-4 right-4 z-20">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? "fixed inset-0 z-10 bg-background" : "hidden"
          } md:relative md:flex md:flex-col md:w-64 border rounded-lg overflow-hidden`}
        >
          <Tabs defaultValue="direct" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="direct">Direct</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
            </TabsList>
            
            <div className="px-4 py-3">
              <Input placeholder="Search..." className="text-sm" />
            </div>
            
            <TabsContent value="direct" className="m-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="p-2 space-y-1">
                  {directMessages.map((dm) => (
                    <div
                      key={dm.id}
                      className={`flex items-center space-x-3 rounded-md px-3 py-2 cursor-pointer ${
                        activeChat === dm.name
                          ? "bg-secondary"
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => handleSelectChat(dm.name)}
                    >
                      <Avatar className="h-8 w-8 relative">
                        <AvatarImage src={dm.avatar} alt={dm.name} />
                        <AvatarFallback>{dm.name[0]}</AvatarFallback>
                        <span
                          className={`absolute bottom-0 right-0 rounded-full w-2.5 h-2.5 ${
                            dm.status === "online"
                              ? "bg-green-500"
                              : dm.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        />
                      </Avatar>
                      <span className="text-sm font-medium flex-1">{dm.name}</span>
                      
                      {/* Unread indicator */}
                      {dm.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                          {dm.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="channels" className="m-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="p-2 space-y-1">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-center space-x-3 rounded-md px-3 py-2 cursor-pointer ${
                        activeChat === channel.name
                          ? "bg-secondary"
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => handleSelectChat(channel.name)}
                    >
                      <span className="text-sm font-medium">#{channel.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
          <div className="border-b px-6 py-3 flex items-center justify-between">
            <div className="font-medium">
              {activeTab === "direct" ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" alt={activeChat} />
                    <AvatarFallback>{activeChat[0]}</AvatarFallback>
                  </Avatar>
                  <span>{activeChat}</span>
                </div>
              ) : (
                <span>#{activeChat}</span>
              )}
            </div>
            
            {/* In real app, add action buttons here (call, video, etc.) */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      msg.isCurrentUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${msg.isCurrentUser ? "ml-2" : "mr-2"}`}>
                      <AvatarImage src={msg.avatar} alt={msg.sender} />
                      <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="relative">
                        <div
                          className={`px-4 py-3 rounded-md ${
                            msg.isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                          onMouseEnter={() => setReactionMessageId(msg.id)}
                          onMouseLeave={() => {
                            // Small delay to allow clicking emoji picker
                            if (!showEmojiPicker) {
                              setReactionMessageId(null);
                            }
                          }}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        
                        {/* Emoji reactions display */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex mt-1 flex-wrap gap-1">
                            {Object.entries(msg.reactions).map(([emoji, users]) => 
                              users.length > 0 ? (
                                <div 
                                  key={emoji} 
                                  className="flex items-center bg-secondary/50 rounded-full px-1.5 py-0.5 text-xs"
                                  title={users.join(', ')}
                                >
                                  <span className="mr-1">{emoji}</span>
                                  <span>{users.length}</span>
                                </div>
                              ) : null
                            )}
                          </div>
                        )}
                        
                        {/* Emoji picker */}
                        {reactionMessageId === msg.id && (
                          <div className="absolute bottom-full mb-2 bg-background shadow-lg rounded-lg border p-1 flex">
                            {emojis.map(emoji => (
                              <button 
                                key={emoji} 
                                className="hover:bg-secondary rounded p-1 text-lg"
                                onClick={() => addReaction(msg.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex text-xs text-muted-foreground mt-1 ${
                          msg.isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Typing indicator */}
            {typingStatus && (
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <div className="flex space-x-1 items-center">
                  <Circle className="h-2 w-2 animate-pulse" />
                  <Circle className="h-2 w-2 animate-pulse delay-100" />
                  <Circle className="h-2 w-2 animate-pulse delay-200" />
                </div>
                <span className="ml-2">{activeChat} is {typingStatus}</span>
              </div>
            )}
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="border-t p-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Textarea
                placeholder={`Message ${activeChat}...`}
                value={message}
                onChange={handleChangeMessage}
                className="flex-1 min-h-[80px] resize-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground" 
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              <Button type="submit">
                <Send className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
