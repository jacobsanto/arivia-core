
import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { ROLE_DETAILS } from "@/types/auth";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  return (
    <div className="flex h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
        <Shield className="h-12 w-12" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Access Denied</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        You don't have permission to access this page. Your current role is{" "}
        <span className="font-semibold text-foreground">
          {user ? ROLE_DETAILS[user.role].title : "Unknown"}
        </span>
        .
      </p>
      <div className="mt-8">
        <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
      </div>
    </div>
  );
};

export default Unauthorized;
