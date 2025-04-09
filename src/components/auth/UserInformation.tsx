
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE_DETAILS, UserRole } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Edit2, Shield, User as UserIcon, Mail } from "lucide-react";
import { isSecureContext } from "@/utils/securityUtils";
import AvatarUpload from "./AvatarUpload";
import { useIsMobile } from "@/hooks/use-mobile";

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." })
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserInformation = () => {
  const { user, updateProfile, refreshProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const isSuperAdmin = user?.role === "superadmin";

  // Set up form with current user values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || ""
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
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

  const handleEditClick = () => {
    // Reset form with current user values
    form.reset({
      name: user?.name || "",
      email: user?.email || ""
    });
    setIsEditing(true);
  };

  // Function to format the date nicely
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <AvatarUpload user={user} />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <div className="flex flex-wrap mt-2">
                  {getRoleBadges()}
                  {user.customPermissions && Object.keys(user.customPermissions).length > 0 && (
                    <Badge variant="outline" className="bg-blue-50">Custom Permissions</Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* User account details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs mb-1 block">Account ID</Label>
                <div className="text-sm font-medium bg-secondary/50 p-2 rounded-md overflow-hidden text-ellipsis">
                  {user.id}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-1 block">Secure Context</Label>
                <div className="text-sm font-medium">
                  {isSecureContext() ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Check className="h-3 w-3 mr-1" /> Secure
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Insecure
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Only show for superadmin */}
            {isSuperAdmin && (
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium text-blue-700">SuperAdmin Access</h3>
                </div>
                <p className="text-sm text-blue-600 mb-2">
                  You have elevated privileges to manage all aspects of the system.
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
                    System Settings
                  </Badge>
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
                    User Management
                  </Badge>
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
                    Role Configuration
                  </Badge>
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
                    Permission Control
                  </Badge>
                </div>
              </div>
            )}
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
