import React, { useEffect, useState } from "react";
import { Bell, MessageSquare, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ROLE_DETAILS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationTestButton } from "@/components/notifications/NotificationTestButton";


interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle
}) => {
  const {
    user,
    logout,
    refreshProfile
  } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  

  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        refreshProfile().then(updated => {
          if (updated) {
            console.log("Profile automatically refreshed");
          }
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    refreshProfile();
    return () => clearInterval(intervalId);
  }, [user, refreshProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-sidebar-border px-4 py-2 md:px-6 md:py-3 bg-sidebar text-sidebar-foreground" style={{ boxShadow: 'var(--shadow-border)' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo moved to sidebar */}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <NotificationTestButton />
          <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative hidden md:flex border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <NotificationCenter onClose={() => setIsNotificationOpen(false)} />
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hidden md:flex border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <MessageItem name="Maria Kowalska" message="When will the new supplies arrive?" time="5 min ago" avatar="/placeholder.svg" />
                <MessageItem name="Alex Chen" message="I've completed the Villa Oceana inspection." time="30 min ago" avatar="/placeholder.svg" />
                <MessageItem name="Stefan Müller" message="Guest requesting early check-in at Villa Sunset." time="1 hour ago" avatar="/placeholder.svg" />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">
                <span>Open Team Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>
      </div>
    </header>
  );
};


interface MessageItemProps {
  name: string;
  message: string;
  time: string;
  avatar: string;
}

const MessageItem = ({
  name,
  message,
  time,
  avatar
}: MessageItemProps) => {
  return (
    <div className="flex items-start space-x-3 px-2 py-3 hover:bg-secondary cursor-pointer">
      <div className="h-8 w-8 rounded-full overflow-hidden">
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="text-xs text-muted-foreground">{time}</div>
        </div>
        <div className="text-sm text-muted-foreground mt-1 truncate">{message}</div>
      </div>
    </div>
  );
};

export default Header;
