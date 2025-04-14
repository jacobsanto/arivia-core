
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { registerSuperAdmin } from "@/services/auth/adminRegistration";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const superAdminSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters")
});

type SuperAdminFormValues = z.infer<typeof superAdminSchema>;

const CreateSuperAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<SuperAdminFormValues>({
    resolver: zodResolver(superAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      name: ""
    }
  });

  // Check if super admin exists
  useEffect(() => {
    const checkForSuperAdmin = async () => {
      try {
        console.log("Checking for existing super admin...");
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .maybeSingle();
        
        if (error) {
          console.error("Error checking for super admin:", error);
          return;
        }
        
        if (data) {
          console.log("Super admin already exists");
          setSuperAdminExists(true);
        } else {
          console.log("No super admin found");
        }
      } catch (error) {
        console.error("Error checking for super admin:", error);
      }
    };

    checkForSuperAdmin();
  }, []);

  const onSubmit = async (data: SuperAdminFormValues) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Creating super admin with:", data.email);
      const success = await registerSuperAdmin(data.email, data.password, data.name);
      if (success) {
        console.log("Super admin created successfully");
        // Check again if super admin exists after registration attempt
        const { data: adminData } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .maybeSingle();
        
        if (adminData) {
          setSuperAdminExists(true);
          form.reset();
        }
      }
    } catch (err) {
      console.error("Error creating super admin:", err);
      setError(err instanceof Error ? err.message : "Failed to create Super Admin");
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
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Super Admin account has been created successfully.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            {error && (
              <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit"
                disabled={loading || superAdminExists}
                className="w-full"
              >
                {loading ? "Creating Super Admin..." : "Create Super Admin"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateSuperAdmin;
