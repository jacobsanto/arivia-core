
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { AlertCircle, ShieldCheck, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MobileLogin = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary to-blue-700 flex flex-col">
      <div className="flex-1 flex flex-col p-4">
        <div className="mt-6 mb-8 flex justify-center">
          <img src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" alt="Arivia Villas" className="h-16" />
        </div>
        
        <div className="mt-4 bg-white rounded-t-2xl flex-1 p-4">
          <h1 className="text-xl font-bold text-center mb-4">
            {activeTab === "signin" ? "Sign in to your account" : "Create an account"}
          </h1>
          
          <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Welcome to Arivia Villas Operations
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
              <LoginForm isMobile={true} />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Create a new account to access Arivia Villas
                </AlertDescription>
              </Alert>
              <SignUpForm isMobile={true} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="p-3 text-center text-xs text-white bg-blue-800">
        <span>© {new Date().getFullYear()} Arivia Villas. All rights reserved.</span>
      </div>
    </div>
  );
};

export default MobileLogin;
