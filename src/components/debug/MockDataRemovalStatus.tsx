import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Database, Users, MessageSquare } from "lucide-react";
import { TEST_USERS } from "@/services/auth/userAuthService";
import { toast } from "@/hooks/use-toast";

const MockDataRemovalStatus: React.FC = () => {
  const completedSections = [
    { name: "Database Seeding", description: "Test users and basic data created", icon: Database },
    { name: "Chat System", description: "Connected to real Supabase chat tables", icon: MessageSquare },
    { name: "Reports Generator", description: "Using real inventory and task data", icon: CheckCircle },
    { name: "Property Operations", description: "Mock tasks removed, ready for real data", icon: Users }
  ];

  const pendingSections = [
    { name: "Authentication", description: "Need to implement Supabase Auth signup/login" },
    { name: "User Presence", description: "Real online/offline status tracking" },
    { name: "Task Management", description: "Connect to housekeeping_tasks and maintenance_tasks" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Mock Data Removal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Mock data has been successfully removed from core systems. The app now uses real Supabase data with seeded test accounts for role-based testing.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3 text-green-600">✅ Completed</h3>
              <div className="space-y-3">
                {completedSections.map((section, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                    <section.icon className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-muted-foreground">{section.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-orange-600">⏳ Next Steps</h3>
              <div className="space-y-3">
                {pendingSections.map((section, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50">
                    <div className="w-4 h-4 rounded-full border-2 border-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-muted-foreground">{section.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 border rounded-lg bg-blue-50">
            <h4 className="font-semibold mb-2">🧪 Testing Instructions</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Use the test credentials below to explore different user roles. Each role has specific permissions and access levels.
            </p>
            
            <div className="grid gap-2">
              {TEST_USERS.map((testUser, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {testUser.role.replace('_', ' ')}
                    </Badge>
                    <span className="font-mono text-xs">{testUser.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${testUser.email} / ${testUser.password}`);
                      toast({ title: "Copied", description: "Credentials copied to clipboard" });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataRemovalStatus;