import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { TEST_USERS } from "@/services/auth/userAuthService";
import { toast } from "@/hooks/use-toast";

const TestUserCredentials: React.FC = () => {
  const copyCredentials = (email: string, password: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    toast({
      title: "Credentials Copied",
      description: "Test user credentials copied to clipboard"
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Test User Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Use these test credentials to explore different user roles in the app. 
            Click "Copy" to copy credentials to clipboard.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-3">
          {TEST_USERS.map((testUser, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium">{testUser.name}</div>
                  <div className="text-sm text-muted-foreground">{testUser.email}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {testUser.role.replace('_', ' ')}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyCredentials(testUser.email, testUser.password)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestUserCredentials;