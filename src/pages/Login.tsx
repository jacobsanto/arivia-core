
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import LoginWithRoles from "@/components/auth/LoginWithRoles";
import SignUpForm from "@/components/auth/SignUpForm";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-700 p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="mb-8 flex justify-center">
          <img src="/Secondary-Logo.png" alt="Arivia Villas" className="h-16" />
        </div>
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "signin" ? "Sign in to your account" : "Create an account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <LoginWithRoles />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
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
