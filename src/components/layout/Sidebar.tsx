
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import NavItem from "./NavItem";
import { 
  Home, 
  ClipboardCheck, 
  Wrench, 
  Package, 
  BarChart, 
  Settings, 
  Users, 
  MessageSquare,
  Check,
  HomeIcon
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { user } = useUser();
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col bg-primary text-white fixed left-0">
      <div className="flex h-16 items-center justify-center px-4 border-b border-white/10">
        <img 
          src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" 
          alt="Arivia Villas" 
          className="h-10"
        />
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        <NavItem to="/" icon={<Home size={20} />}>Dashboard</NavItem>
        <NavItem to="/properties" icon={<HomeIcon size={20} />}>Properties</NavItem>
        <NavItem to="/housekeeping" icon={<ClipboardCheck size={20} />}>Housekeeping</NavItem>
        <NavItem to="/maintenance" icon={<Wrench size={20} />}>Maintenance</NavItem>
        <NavItem to="/inventory" icon={<Package size={20} />}>Inventory</NavItem>
        <NavItem to="/reports" icon={<BarChart size={20} />}>Reports</NavItem>
        <NavItem to="/analytics" icon={<BarChart size={20} />}>Analytics</NavItem>
        <NavItem to="/team-chat" icon={<MessageSquare size={20} />}>Team Chat</NavItem>
        
        {/* Only show Checklist Templates to superadmin */}
        {isSuperAdmin && (
          <NavItem to="/checklist-templates" icon={<Check size={20} />}>Checklist Templates</NavItem>
        )}

        <div className="mt-6 pt-6 border-t border-white/10">
          <NavItem to="/settings" icon={<Settings size={20} />}>Settings</NavItem>
          <NavItem to="/profile" icon={<Users size={20} />}>Profile</NavItem>
        </div>
      </nav>
      
      <div className="p-4 border-t border-white/10 text-xs text-white/70">
        <p>Arivia Villas Management</p>
        <p>v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
