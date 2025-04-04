
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  ClipboardList,
  Wrench,
  Package,
  MessageSquare,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  return (
    <div className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      <div className="flex items-center justify-center py-6">
        {/* Logo goes here */}
        <img 
          src="/Secondary-Logo.png" 
          alt="Arivia Villas Logo" 
          className="h-10 w-auto" 
        />
      </div>
      
      <nav className="mt-6 flex-1 space-y-1">
        <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/properties" icon={<Home size={20} />} label="Properties" />
        <SidebarLink to="/tasks" icon={<ClipboardList size={20} />} label="Tasks" />
        <SidebarLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" />
        <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />
        <SidebarLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" />
        <SidebarLink to="/reports" icon={<BarChart size={20} />} label="Reports" />
      </nav>
      
      <div className="pt-4 border-t border-sidebar-border mt-6">
        <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink = ({ to, icon, label }: SidebarLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-2 rounded-md font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
