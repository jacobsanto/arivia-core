
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield } from "lucide-react";

const UnauthorizedPermissionView: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          User Permissions
        </CardTitle>
        <CardDescription>
          Only Super Admins can manage user permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 opacity-20" />
            <p className="mt-2">You don't have permission to manage user permissions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnauthorizedPermissionView;
