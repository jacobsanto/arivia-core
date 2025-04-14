
import React from "react";
import { User, UserRole, ROLE_DETAILS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";

interface UserCardContentProps {
  user: User;
}

const UserCardContent: React.FC<UserCardContentProps> = ({ user }) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Role</p>
        <Badge variant="outline">{ROLE_DETAILS[user.role].title}</Badge>
        
        {user.secondaryRoles && user.secondaryRoles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {user.secondaryRoles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                +{ROLE_DETAILS[role].title}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {user.customPermissions && Object.keys(user.customPermissions).length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Custom Permissions</p>
          <Badge variant="outline" className="text-xs bg-blue-50">
            Custom Permissions Applied
          </Badge>
        </div>
      )}
    </div>
  );
};

export default UserCardContent;
