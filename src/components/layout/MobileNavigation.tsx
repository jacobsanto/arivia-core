import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavigationItems } from "@/lib/utils/routing";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

interface MobileNavigationProps {
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onClose }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin";

  const navigationItems = getNavigationItems(user?.role || "property_manager");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Explore Arivia Villa Sync
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="my-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || "Guest"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    navigate("/admin");
                    onClose();
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
