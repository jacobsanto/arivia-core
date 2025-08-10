
import React from "react";
import { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { ROLE_DETAILS } from "@/types/auth";
import AvatarUpload from "../avatar/AvatarUpload";
import { useUser } from "@/contexts/UserContext";

interface UserProfileInfoProps {
  user: User;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  const { refreshProfile } = useUser();

  const getRoleBadges = () => {
    const badges = [];
    
    // Add primary role badge
    badges.push(
      <Badge key={user.role} className="mr-1 mb-1">
        {ROLE_DETAILS[user.role].title}
      </Badge>
    );
    
    // Add secondary role badges if they exist
    if (user.secondaryRoles && user.secondaryRoles.length > 0) {
      user.secondaryRoles.forEach((role) => {
        badges.push(
          <Badge key={role} variant="secondary" className="mr-1 mb-1">
            {ROLE_DETAILS[role].title}
          </Badge>
        );
      });
    }
    
    return badges;
  };

  const handleAvatarChange = async () => {
    await refreshProfile();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex justify-center sm:justify-start">
          <AvatarUpload 
            user={user} 
            size="lg" 
            onAvatarChange={handleAvatarChange}
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {user.email}
          </p>
          {user.phone && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {user.phone}
            </p>
          )}
          <div className="flex flex-wrap mt-2">
            {getRoleBadges()}
            {user.customPermissions && Object.keys(user.customPermissions).length > 0 && (
              <Badge variant="outline" className="bg-blue-50">Custom Permissions</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
