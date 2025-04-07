import React from "react";
import { Bell, MessageSquare, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ROLE_DETAILS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
const Header = () => {
  const {
    user,
    logout
  } = useUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return <header className="border-b border-border px-6 py-3 bg-background">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" alt="Villa Sync" className="h-8 mr-3" />
          
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <NotificationItem title="New Maintenance Request" message="Villa Caldera has reported a plumbing issue in the master bathroom." time="10 minutes ago" />
                <NotificationItem title="Housekeeping Task Completed" message="Villa Azure cleanup has been completed and verified." time="1 hour ago" />
                <NotificationItem title="Low Inventory Alert" message="Bathroom supplies are running low at Villa Sunset." time="2 hours ago" />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
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
                Open Team Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{user?.name || "Guest"}</span>
                {user && <Badge variant="outline" className="ml-2">
                    {ROLE_DETAILS[user.role].title}
                  </Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
};
interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
}
const NotificationItem = ({
  title,
  message,
  time
}: NotificationItemProps) => {
  return <div className="px-2 py-3 hover:bg-secondary cursor-pointer">
      <div className="font-medium text-sm">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{message}</div>
      <div className="text-xs text-muted-foreground mt-1">{time}</div>
    </div>;
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
  return <div className="flex items-start space-x-3 px-2 py-3 hover:bg-secondary cursor-pointer">
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
    </div>;
};
export default Header;