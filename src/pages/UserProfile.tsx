
import React from "react";
import { useUser } from "@/contexts/UserContext";
import RoleInfo from "@/components/auth/RoleInfo";
import RoleManagement from "@/components/auth/RoleManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings } from "lucide-react";

const UserProfile = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-muted-foreground">Manage your account and permissions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Name</h4>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Email</h4>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">User ID</h4>
                <p className="text-sm text-muted-foreground">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RoleInfo user={user} />
      </div>

      <div className="mt-6">
        <RoleManagement />
      </div>
    </div>
  );
};

export default UserProfile;
