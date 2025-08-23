
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
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
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
        setCheckingAdmin(true);
        // Check for existing super admin
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // Not found is OK
            setError("Error checking for Super Admin");
          }
          return;
        }
        
        if (data) {
          setSuperAdminExists(true);
        }
      } catch (error) {
        console.error("Error checking for super admin:", error);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkForSuperAdmin();
  }, []);

  const onSubmit = async (data: SuperAdminFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const success = await registerSuperAdmin(data.email, data.password, data.name);
      if (success) {
        // Verify super admin was created
        const { data: adminData } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .single();
        
        if (adminData) {
          setSuperAdminExists(true);
          form.reset();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Super Admin");
      
      // Better error handling for network issues
      if (err instanceof Error && err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your internet connection.");
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
        {checkingAdmin && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Checking for existing Super Admin...</span>
          </div>
        )}
        
        {!checkingAdmin && superAdminExists && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Super Admin account has been created successfully.
            </AlertDescription>
          </Alert>
        )}
        
        {!checkingAdmin && !superAdminExists && (
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
                      <Input type="email" placeholder="admin@example.com" {...field} autoComplete="username" />
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
                      <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
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
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Super Admin...
                  </>
                ) : "Create Super Admin"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateSuperAdmin;
