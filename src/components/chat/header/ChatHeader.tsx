
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  activeChat: string;
  activeTab: string;
  toggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  activeTab,
  toggleSidebar,
}) => {
  const isMobile = useIsMobile();

  return (
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
      
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button variant="ghost" size="sm" onClick={toggleSidebar}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
