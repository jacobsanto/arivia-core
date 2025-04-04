
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import LoginWithRoles from "@/components/auth/LoginWithRoles";

const Login = () => {
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
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <LoginWithRoles />
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
