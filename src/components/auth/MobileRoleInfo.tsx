
import React from "react";
import { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User as UserIcon } from "lucide-react";
import { ROLE_DETAILS } from "@/types/auth";

interface MobileRoleInfoProps {
  user: User;
}

const MobileRoleInfo: React.FC<MobileRoleInfoProps> = ({ user }) => {
  const roleDetails = ROLE_DETAILS[user.role];
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "destructive";
      case "tenant_admin":
        return "default";
      case "property_manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Role</CardTitle>
          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
            {user.role === "superadmin" || user.role === "tenant_admin" ? (
              <Shield className="h-3 w-3" />
            ) : (
              <UserIcon className="h-3 w-3" />
            )}
            {roleDetails.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-sm text-muted-foreground mb-4">
          {roleDetails.description}
        </div>
        
        <div>
          <h4 className="text-xs font-medium mb-1">Access Level</h4>
          <MobileAccessLevelIndicator role={user.role} />
        </div>
      </CardContent>
    </Card>
  );
};

const MobileAccessLevelIndicator: React.FC<{ role: string }> = ({ role }) => {
  const accessLevels = [
    { roles: ["housekeeping_staff", "maintenance_staff"], level: "Basic" },
    { roles: ["concierge", "inventory_manager"], level: "Standard" },
    { roles: ["property_manager"], level: "Advanced" },
    { roles: ["tenant_admin"], level: "Full" },
    { roles: ["superadmin"], level: "Unlimited" }
  ];

  const userAccessLevel = accessLevels.find(level => level.roles.includes(role))?.level || "Basic";
  const levels = ["Basic", "Standard", "Advanced", "Full", "Unlimited"];
  const currentIndex = levels.indexOf(userAccessLevel);

  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs mb-1">
        {levels.map((level, index) => (
          <span key={level} className={level === userAccessLevel ? "font-bold text-primary" : "text-[10px]"}>
            {index === 0 || index === levels.length - 1 || level === userAccessLevel ? level : ""}
          </span>
        ))}
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div 
          className="h-full rounded-full bg-primary" 
          style={{ width: `${((currentIndex + 1) / levels.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default MobileRoleInfo;
