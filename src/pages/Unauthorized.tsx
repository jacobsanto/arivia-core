
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { ROLE_DETAILS, FEATURE_PERMISSIONS } from "@/types/auth";
import { Card, CardContent } from "@/components/ui/card";

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // Try to determine what page user was trying to access
  const attemptedPath = location.state?.from?.pathname || "";
  
  // Map paths to required roles (simplified version)
  const pathToRoles: Record<string, string[]> = {
    '/properties': ["superadmin", "administrator", "property_manager"],
    '/tasks': ["superadmin", "administrator", "property_manager", "housekeeping_staff", "maintenance_staff"],
    '/maintenance': ["superadmin", "administrator", "property_manager", "maintenance_staff"],
    '/inventory': ["superadmin", "administrator", "property_manager", "inventory_manager"],
    '/reports': ["superadmin", "administrator", "property_manager"],
    '/settings': ["superadmin", "administrator"],
  };
  
  // Get required roles for attempted path
  const requiredRoles = pathToRoles[attemptedPath] || [];
  
  // Get role differences
  const missingFeatures = user ? Object.entries(FEATURE_PERMISSIONS)
    .filter(([_, permission]) => permission.allowedRoles.includes(requiredRoles[0] || "administrator") && 
                              !permission.allowedRoles.includes(user.role))
    .map(([key, permission]) => permission.title)
    : [];
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-4 text-muted-foreground">
            You don't have permission to access this page. Your current role is{" "}
            <span className="font-semibold text-foreground">
              {user ? ROLE_DETAILS[user.role].title : "Unknown"}
            </span>
            .
          </p>
          
          {requiredRoles.length > 0 && (
            <div className="mt-6">
              <div className="bg-amber-50 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                  <div className="text-left">
                    <h3 className="font-medium text-amber-900">Required Access Level</h3>
                    <p className="text-sm text-amber-700">
                      This page requires one of these roles:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {requiredRoles.map(role => (
                        <span 
                          key={role} 
                          className="inline-block px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                        >
                          {ROLE_DETAILS[role as any]?.title || role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {missingFeatures.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-sm">Missing Permissions:</h3>
              <ul className="text-sm text-muted-foreground mt-1">
                {missingFeatures.slice(0, 5).map((feature, i) => (
                  <li key={i} className="inline-block mx-1">
                    {feature}{i < Math.min(missingFeatures.length, 5) - 1 ? ',' : ''}
                  </li>
                ))}
                {missingFeatures.length > 5 && <li className="inline-block">and more...</li>}
              </ul>
            </div>
          )}
          
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/")}>Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
