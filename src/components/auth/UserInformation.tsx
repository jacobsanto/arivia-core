
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserState } from "@/contexts/hooks";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import ProfileForm from "./forms/ProfileForm";
import UserProfileInfo from "./profile/UserProfileInfo";
import AccountDetails from "./profile/AccountDetails";
import SuperAdminInfo from "./profile/SuperAdminInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { updateUserProfile } from "@/contexts/auth/userAuthOperations";
import { logger } from "@/services/logger";


const UserInformation = () => {
  const { user: currentUser } = useAuth();
  const { setUser, refreshUserProfile } = useUserState();
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFormCancel = () => {
    setIsEditing(false);
  };

  const handleFormSubmit = async (data: { name: string; email: string; phone?: string }) => {
    if (!currentUser) return;
    
    try {
      const result = await updateUserProfile(
        currentUser.id,
        {
          name: data.name,
          email: data.email,
          phone: data.phone
        },
        setUser,
        currentUser
      );
      
      if (result) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // Ensure profile is refreshed after successful update
        await refreshUserProfile();
      }
    } catch (error) {
      logger.error("Error updating profile", error);
      toast.error("Failed to update profile", {
        description: "Please try again later"
      });
    }
  };

  if (!currentUser) {
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
            user={currentUser} 
            onCancel={handleFormCancel}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <div className="space-y-6">
            <UserProfileInfo user={currentUser} />
            <AccountDetails user={currentUser} />
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
