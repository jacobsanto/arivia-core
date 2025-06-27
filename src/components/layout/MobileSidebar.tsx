import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarClose } from "./SidebarClose";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { getNavigationItems } from "@/lib/utils/routing";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useUser();
  const isMobile = useIsMobile();

  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin";

  const navigationItems = getNavigationItems(user?.role || "property_manager");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{user?.name || "Guest"}</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="grid gap-2">
            {navigationItems.map((item) => (
              <Link to={item.path} key={item.label} className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-secondary">
                <span>{item.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin/users" className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-secondary">
                <span>Manage Users</span>
              </Link>
            )}
          </nav>
        </div>
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
