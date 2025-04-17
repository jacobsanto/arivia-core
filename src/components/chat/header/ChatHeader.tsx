
import React from "react";
import { Menu, User, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  activeChat: string;
  activeTab: string;
  toggleSidebar: () => void;
  isOffline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  activeTab,
  toggleSidebar,
  isOffline = false,
}) => {
  const isMobile = useIsMobile();
  
  const Icon = activeTab === "direct" ? User : Users;
  
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">
          {activeTab === "direct" ? "" : "#"}
          {activeChat}
        </h3>
        {isOffline ? (
          <WifiOff size={16} className="text-amber-600" />
        ) : (
          <Wifi size={16} className="text-green-600" />
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
