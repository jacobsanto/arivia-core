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

const SidebarNavigation = () => {
  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <nav className="px-2 py-2">
        <div className="space-y-4">
          <SidebarLink to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
          
          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">Properties</h3>
            <div className="space-y-1">
              <SidebarLink to="/properties" icon={<Building2 size={18} />} label="Properties" />
              <SidebarLink to="/bookings" icon={<CalendarDays size={18} />} label="Bookings" />
            </div>
          </div>

          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">Management</h3>
            <div className="space-y-1">
              <SidebarLink to="/maintenance" icon={<Wrench size={18} />} label="Maintenance" />
              <SidebarLink to="/users" icon={<Users size={18} />} label="Users" />
            </div>
          </div>

          <SidebarLink to="/inventory" icon={<PackageSearch size={18} />} label="Inventory" />

          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">Integrations</h3>
            <div className="space-y-1">
              <SidebarLink 
                to="/drive-integration" 
                icon={<FileSpreadsheet size={18} />} 
                label="Google Drive" 
              />
              
              <SidebarLink 
                to="/google-sheets" 
                icon={<Table size={18} />} 
                label="Google Sheets" 
              />
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold tracking-tight uppercase text-muted-foreground mb-2">System</h3>
            <div className="space-y-1">
              <SidebarLink to="/settings" icon={<Settings size={18} />} label="Settings" />
            </div>
          </div>
        </div>
      </nav>
    </ScrollArea>
  );
};

export default SidebarNavigation;
