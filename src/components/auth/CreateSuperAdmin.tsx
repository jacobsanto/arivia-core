
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { registerSuperAdmin } from "@/services/auth/adminRegistration";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CreateSuperAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  
  // Check if super admin exists
  useEffect(() => {
    const checkForSuperAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .maybeSingle();
        
        if (!error && data) {
          setSuperAdminExists(true);
        }
      } catch (error) {
        console.error("Error checking for super admin:", error);
      }
    };

    checkForSuperAdmin();
  }, []);

  const handleCreateSuperAdmin = async () => {
    setLoading(true);
    try {
      await registerSuperAdmin();
      // Check again if super admin exists after registration attempt
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'superadmin')
        .maybeSingle();
      
      if (data) {
        setSuperAdminExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Super Admin Setup</CardTitle>
        <CardDescription>
          Create the initial Super Admin account for the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {superAdminExists ? (
          <div className="text-sm text-green-600">
            Super Admin account has been created successfully.
          </div>
        ) : (
          <Button 
            onClick={handleCreateSuperAdmin} 
            disabled={loading || superAdminExists}
            className="w-full"
          >
            {loading ? "Creating Super Admin..." : "Create Super Admin"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateSuperAdmin;
