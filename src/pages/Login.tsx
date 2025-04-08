
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginWithRoles from "@/components/auth/LoginWithRoles";
import SignUpForm from "@/components/auth/SignUpForm";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-700 p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="mb-8 flex justify-center">
          <img src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" alt="Arivia Villas" className="h-20" />
        </div>
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "signin" ? "Sign in to your account" : "Create an account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <GoogleSignInButton isLoading={isLoading} setIsLoading={setIsLoading} />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Tabs 
              defaultValue="signin" 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-0">
                <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    Secure password authentication is enabled
                  </AlertDescription>
                </Alert>
                <LoginWithRoles />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    For demo purposes, new accounts are stored locally
                  </AlertDescription>
                </Alert>
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-white">
          <span>© {new Date().getFullYear()} Arivia Villas. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
