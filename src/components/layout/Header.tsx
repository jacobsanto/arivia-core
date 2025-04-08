
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu,
  User,
  LogOut,
  Bell,
  Settings
} from "lucide-react";
import { useUser } from "@/contexts/auth/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import MobileNav from "./MobileNav";
import NotificationDrawer from "../notifications/NotificationDrawer"; 

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout, unreadNotifications } = useUser();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };

  const openNotifications = () => {
    setNotificationsOpen(true);
  };

  if (!user) return null;

  const isAdmin = user.role === "administrator" || user.role === "superadmin";
  const userInitials = user.name ? user.name.substring(0, 1).toUpperCase() : 'U';
  
  return (
    <>
      <header className="bg-background border-b flex h-14 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <MobileNav />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification button */}
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={openNotifications}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center" 
                        variant="destructive"
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* User dropdown */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>User menu</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={navigateToProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                {user.pendingApproval && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Pending
                  </Badge>
                )}
              </DropdownMenuItem>
              {(user.role === "administrator" || user.role === "superadmin") && (
                <DropdownMenuItem onClick={navigateToSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Notification drawer */}
      <NotificationDrawer 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </>
  );
};

export default Header;
