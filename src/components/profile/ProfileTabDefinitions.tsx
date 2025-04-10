
import React from "react";
import { User, Shield, DatabaseZap, CloudOff } from "lucide-react";
import { User as UserType } from "@/types/auth";

interface TabDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const useProfileTabs = (user: UserType | null, canViewPermissions: boolean) => {
  const showPermissions = user?.role === "superadmin" || canViewPermissions;

  const tabs: TabDefinition[] = [
    { id: "info", label: "Information", icon: <User className="h-4 w-4" /> },
    ...(showPermissions ? [{ id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> }] : []),
    { id: "security", label: "Security", icon: <DatabaseZap className="h-4 w-4" /> },
    { id: "offline", label: "Offline Data", icon: <CloudOff className="h-4 w-4" /> }
  ];

  return { tabs };
};
