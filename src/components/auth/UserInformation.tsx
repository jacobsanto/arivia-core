
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import ProfileForm from "./forms/ProfileForm";
import UserProfileInfo from "./profile/UserProfileInfo";
import AccountDetails from "./profile/AccountDetails";
import SuperAdminInfo from "./profile/SuperAdminInfo";

const UserInformation = () => {
  const { user, updateProfile, refreshProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const isSuperAdmin = user?.role === "superadmin";

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFormCancel = () => {
    setIsEditing(false);
  };

  const handleFormSubmit = async (data: { name: string; email: string }) => {
    if (!user) return;
    
    try {
      const result = await updateProfile(user.id, {
        name: data.name,
        email: data.email
      });
      
      if (result) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        refreshProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "Please try again later"
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" /> 
          User Information
        </CardTitle>
        <CardDescription>
          Your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <ProfileForm 
            user={user} 
            onCancel={handleFormCancel}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <div className="space-y-6">
            <UserProfileInfo user={user} />
            <AccountDetails user={user} />
            {isSuperAdmin && <SuperAdminInfo />}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {!isEditing && (
          <Button variant="outline" onClick={handleEditClick}>
            <Edit2 className="h-4 w-4 mr-2" /> 
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserInformation;
