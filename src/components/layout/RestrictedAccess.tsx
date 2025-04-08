
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RestrictedAccessProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

const RestrictedAccess: React.FC<RestrictedAccessProps> = ({
  title = "Restricted Access",
  message = "Your account is pending approval from an administrator. You'll have full access once your account is approved.",
  showHomeButton = true
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>In the meantime, you can view your profile and account settings.</p>
        </CardContent>
        {showHomeButton && (
          <CardFooter className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default RestrictedAccess;
