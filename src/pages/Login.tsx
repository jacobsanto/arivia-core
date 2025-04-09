
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreateSuperAdmin from "@/components/auth/CreateSuperAdmin";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLogin from "@/components/auth/MobileLogin";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLogin />;
  }

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
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Using Supabase authentication with database integration
              </AlertDescription>
            </Alert>
            
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
                    Secure authentication powered by Supabase
                  </AlertDescription>
                </Alert>
                <LoginForm />
                <CreateSuperAdmin />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Create a new account to access Arivia Villas
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
