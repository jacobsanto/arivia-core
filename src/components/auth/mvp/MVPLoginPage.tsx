import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MVPLoginForm } from "./MVPLoginForm";
import { MVPSignUpForm } from "./MVPSignUpForm";
import { MVPLoginHero } from "./MVPLoginHero";

import { Badge } from "@/components/ui/badge";
export const MVPLoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    isAuthenticated,
    isLoading
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard", {
        replace: true
      });
    }
  }, [isAuthenticated, isLoading, navigate]);
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>;
  }
  if (isAuthenticated) {
    return null;
  }
  return <>
      <Helmet>
        <title>Sign In - Arivia Villas Management</title>
      </Helmet>
      
      <div className="min-h-screen flex">
        {/* Left side - Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 md:p-10">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img src="/lovable-uploads/c71ac675-b13f-4479-a62a-758f193152c2.png" alt="Arivia Villas Logo" className="h-20 w-auto object-contain" />
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Arivia Villas
              </h1>
              <p className="text-muted-foreground">
                Professional property management platform
              </p>
            </div>

            {/* Login/Signup Tabs */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">
                  {activeTab === "signin" ? "Sign In" : "Create Account"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="mt-6">
                    <MVPLoginForm onSwitchToSignUp={() => setActiveTab("signup")} />
                  </TabsContent>
                  <TabsContent value="signup" className="mt-6">
                    <MVPSignUpForm onSwitchToSignIn={() => setActiveTab("signin")} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>


            {/* Footer */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              <p>© 2024 Arivia Group. All rights reserved.</p>
            </div>
          </div>
        </div>
        
        {/* Right side - Hero/Info Panel (hidden on mobile) */}
        {!isMobile && <MVPLoginHero />}
      </div>
    </>;
};