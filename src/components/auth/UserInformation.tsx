
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit3, Mail, Phone, Shield, Calendar } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import ProfileForm from "./forms/ProfileForm";
import AvatarUpload from "./avatar/AvatarUpload";
import { profileToUser } from "@/types/auth/base";

const UserInformation = () => {
  const { user, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No user information available</p>
        </CardContent>
      </Card>
    );
  }

  // Convert user profile to User type for ProfileForm
  const convertedUser = profileToUser({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    secondary_roles: user.secondary_roles,
    custom_permissions: user.custom_permissions
  });

  const handleSave = async (formData: any) => {
    setIsUpdating(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <AvatarUpload user={convertedUser} />
            </div>
            
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <ProfileForm
                  user={convertedUser}
                  onSubmit={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.phone && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.phone}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary" className="capitalize">
                          {user.role?.replace('_', ' ') || 'No role assigned'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInformation;
