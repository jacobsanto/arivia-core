
import React from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Channel and DM types
export interface Channel {
  id: string;
  name: string;
  unreadCount: number;
  status: "online" | "offline" | "away"; // For consistency with DirectMessage
}

export interface DirectMessage {
  id: string;
  name: string;
  avatar: string;
  unreadCount: number;
  status: "online" | "offline" | "away";
}

interface ChatSidebarProps {
  channels: Channel[];
  directMessages: DirectMessage[];
  activeChat: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleSelectChat: (chatId: string, chatName: string, type: 'general' | 'direct') => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  directMessages,
  activeChat,
  activeTab,
  setActiveTab,
  handleSelectChat,
  sidebarOpen,
  toggleSidebar,
}) => {
  const isMobile = useIsMobile();

  // For mobile, the sidebar takes up the full screen when open
  const sidebarClasses = isMobile 
    ? sidebarOpen ? "fixed inset-0 z-30 bg-background" : "hidden"
    : "relative flex flex-col w-64 border rounded-lg overflow-hidden";

  return (
    <div className={sidebarClasses}>
      <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-3">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="direct">Direct</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          
          {isMobile && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="px-4 py-2">
          <Input placeholder="Search..." className="text-sm" />
        </div>
        
        <TabsContent value="direct" className="m-0">
          <ScrollArea className={isMobile ? "h-[calc(100vh-8rem)]" : "h-[calc(100vh-20rem)]"}>
            <div className="p-2 space-y-1">
              {directMessages.map((dm) => (
                <div
                  key={dm.id}
                  className={`flex items-center space-x-3 rounded-md px-3 py-2 cursor-pointer ${
                    activeChat === dm.name
                      ? "bg-secondary"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => {
                    handleSelectChat(dm.id, dm.name, 'direct');
                  }}
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
          <ScrollArea className={isMobile ? "h-[calc(100vh-8rem)]" : "h-[calc(100vh-20rem)]"}>
            <div className="p-2 space-y-1">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`flex items-center space-x-3 rounded-md px-3 py-2 cursor-pointer ${
                    activeChat === channel.name
                      ? "bg-secondary"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => {
                    handleSelectChat(channel.id, channel.name, 'general');
                  }}
                >
                  <span className="text-sm font-medium">#{channel.name}</span>
                  
                  {/* Unread indicator */}
                  {channel.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-auto">
                      {channel.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatSidebar;
