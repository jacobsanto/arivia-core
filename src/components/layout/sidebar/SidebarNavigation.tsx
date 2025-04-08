
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarLink from "./SidebarLink";
import {
  Home,
  Building2,
  CalendarDays,
  Users,
  Settings,
  Wrench,
  PackageSearch,
  Table,
  FileSpreadsheet,
} from "lucide-react";
import { UserRole } from "@/types/auth";

interface SidebarNavigationProps {
  user?: { role: UserRole; secondaryRoles?: UserRole[] };
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ user }) => {
  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <nav className="px-2 py-2">
        <div className="space-y-4">
          <SidebarLink to="/dashboard" icon={<Home size={18} />}>
            Dashboard
          </SidebarLink>
          
          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">Properties</h3>
            <div className="space-y-1">
              <SidebarLink to="/properties" icon={<Building2 size={18} />}>
                Properties
              </SidebarLink>
              <SidebarLink to="/bookings" icon={<CalendarDays size={18} />}>
                Bookings
              </SidebarLink>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">Management</h3>
            <div className="space-y-1">
              <SidebarLink to="/maintenance" icon={<Wrench size={18} />}>
                Maintenance
              </SidebarLink>
              <SidebarLink to="/users" icon={<Users size={18} />}>
                Users
              </SidebarLink>
            </div>
          </div>

          <SidebarLink to="/inventory" icon={<PackageSearch size={18} />}>
            Inventory
          </SidebarLink>

          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">Integrations</h3>
            <div className="space-y-1">
              <SidebarLink to="/drive-integration" icon={<FileSpreadsheet size={18} />}>
                Google Drive
              </SidebarLink>
              
              <SidebarLink to="/google-sheets" icon={<Table size={18} />}>
                Google Sheets
              </SidebarLink>
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">System</h3>
            <div className="space-y-1">
              <SidebarLink to="/settings" icon={<Settings size={18} />}>
                Settings
              </SidebarLink>
            </div>
          </div>
        </div>
      </nav>
    </ScrollArea>
  );
};

export default SidebarNavigation;
