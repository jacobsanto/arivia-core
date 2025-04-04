
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paperclip, Send } from "lucide-react";

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
  { id: 1, name: "Maria Kowalska", avatar: "/placeholder.svg", status: "online" },
  { id: 2, name: "Alex Chen", avatar: "/placeholder.svg", status: "offline" },
  { id: 3, name: "Stefan Müller", avatar: "/placeholder.svg", status: "online" },
  { id: 4, name: "Sophia Rodriguez", avatar: "/placeholder.svg", status: "away" },
];

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

const TeamChat = () => {
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState("Maria Kowalska");
  const [activeTab, setActiveTab] = useState("direct");
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Sending message:", message);
      // In a real app, this would send the message to the backend
      setMessage("");
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
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 border rounded-lg overflow-hidden">
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
                      onClick={() => setActiveChat(dm.name)}
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
                      <span className="text-sm font-medium">{dm.name}</span>
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
                      onClick={() => setActiveChat(channel.name)}
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
          <div className="border-b px-6 py-3 flex items-center">
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
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {sampleMessages.map((msg) => (
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
                      <div
                        className={`px-4 py-3 rounded-md ${
                          msg.isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
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
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="border-t p-4 flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder={`Message ${activeChat}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
