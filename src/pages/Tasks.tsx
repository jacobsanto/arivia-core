
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Tasks: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to access tasks.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your assigned tasks
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Task management functionality will be implemented here.
              Current user: {user.name} ({user.role})
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;
