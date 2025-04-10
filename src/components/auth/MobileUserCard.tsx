import React from "react";
import { User, ROLE_DETAILS } from "@/types/auth";
import { 
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import AvatarUpload from "./avatar/AvatarUpload";

interface MobileUserCardProps {
  user: User;
  currentUser: User | null;
  onEditRole: (userId: string) => void;
  onEditPermissions: (user: User) => void;
  onDeleteClick: (user: User) => void;
  isExpanded: boolean;
  toggleExpand: (userId: string) => void;
}

const MobileUserCard: React.FC<MobileUserCardProps> = ({
  user,
  currentUser,
  onEditRole,
  onEditPermissions,
  onDeleteClick,
  isExpanded,
  toggleExpand
}) => {
  return (
    <Card className="mb-3">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer border-b"
        onClick={() => toggleExpand(user.id)}
      >
        <div className="flex items-center gap-2">
          <AvatarUpload user={user} size="sm" editable={false} />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <>
          <CardContent className="pt-3">
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
              
              {user.customPermissions && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Custom Permissions</p>
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    Custom Permissions Applied
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2 pt-0">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onEditPermissions(user)}
            >
              Permissions
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onEditRole(user.id)}
            >
              Change Role
            </Button>
            {user.id !== currentUser?.id && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteClick(user)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default MobileUserCard;
