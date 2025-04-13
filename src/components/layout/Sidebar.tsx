import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  User,
  ListChecks,
  LogOut,
  BedDouble,
  Wrench,
  FileBarGraph,
  ClipboardList,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
    onClick?.();
  };

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start font-normal ${
        isActive ? "bg-secondary text-foreground hover:bg-secondary/80" : "hover:bg-accent hover:text-accent-foreground"
      }`}
      onClick={handleClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

const Sidebar = () => {
  const { user, logout, hasPermission } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const closeOnMobile = () => {
    if (isMobile) {
      document.body.classList.remove("overflow-hidden");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r py-4">
      <div className="px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || "Avatar"} />
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "AV"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={8} forceMount className="w-48">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-1">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          isActive={pathname === "/dashboard"}
          onClick={closeOnMobile}
        />
        <NavItem
          to="/housekeeping"
          icon={<BedDouble className="h-5 w-5" />}
          label="Housekeeping"
          isActive={pathname === "/housekeeping"}
          onClick={closeOnMobile}
        />
        <NavItem
          to="/maintenance"
          icon={<Wrench className="h-5 w-5" />}
          label="Maintenance"
          isActive={pathname === "/maintenance"}
          onClick={closeOnMobile}
        />
        {hasPermission(["superadmin", "administrator"]) && (
          <NavItem
            to="/reports"
            icon={<FileBarGraph className="h-5 w-5" />}
            label="Reports"
            isActive={pathname === "/reports"}
            onClick={closeOnMobile}
          />
        )}
        {hasPermission(["superadmin"]) && (
          <NavItem
            to="/users"
            icon={<User className="h-5 w-5" />}
            label="Users"
            isActive={pathname === "/users"}
            onClick={closeOnMobile}
          />
        )}
            
            {hasPermission(["superadmin"]) && (
              <NavItem
                to="/checklist-templates"
                icon={<ClipboardList className="h-5 w-5" />}
                label="Checklist Templates"
                isActive={pathname === "/checklist-templates"}
                onClick={closeOnMobile}
              />
            )}
            
          </div>
    </div>
  );
};

export default Sidebar;
