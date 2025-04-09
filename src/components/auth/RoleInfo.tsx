import React from "react";
import { User, UserRole, ROLE_DETAILS } from "@/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User as UserIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileRoleInfo from "./MobileRoleInfo";

interface RoleInfoProps {
  user: User;
}

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "superadmin":
      return "destructive";
    case "administrator":
      return "default";
    case "property_manager":
      return "secondary";
    default:
      return "outline";
  }
};

const getRoleIcon = (role: UserRole) => {
  if (role === "superadmin" || role === "administrator") {
    return <Shield className="h-5 w-5" />;
  }
  return <UserIcon className="h-5 w-5" />;
};

const RoleInfo: React.FC<RoleInfoProps> = ({ user }) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileRoleInfo user={user} />;
  }
  
  const roleDetails = ROLE_DETAILS[user.role];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Role Information</CardTitle>
          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
            {getRoleIcon(user.role)}
            {roleDetails.title}
          </Badge>
        </div>
        <CardDescription>Your permissions and access levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold">Description</h4>
            <p className="text-sm text-muted-foreground">{roleDetails.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Access Level</h4>
            <AccessLevelIndicator role={user.role} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AccessLevelIndicator: React.FC<{ role: UserRole }> = ({ role }) => {
  const accessLevels = [
    { roles: ["housekeeping_staff", "maintenance_staff"], level: "Basic" },
    { roles: ["concierge", "inventory_manager"], level: "Standard" },
    { roles: ["property_manager"], level: "Advanced" },
    { roles: ["administrator"], level: "Full" },
    { roles: ["superadmin"], level: "Unlimited" }
  ];

  const userAccessLevel = accessLevels.find(level => level.roles.includes(role))?.level || "Basic";
  
  const levels = ["Basic", "Standard", "Advanced", "Full", "Unlimited"];
  const currentIndex = levels.indexOf(userAccessLevel);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        {levels.map(level => (
          <span key={level} className={level === userAccessLevel ? "font-bold text-primary" : ""}>
            {level}
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

export default RoleInfo;
