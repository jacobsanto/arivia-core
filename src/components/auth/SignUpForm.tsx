
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signUpFormSchema, SignUpFormValues } from "@/lib/validation/auth-schema";
import { useUser } from "@/contexts/UserContext";
import SignUpFormFields from "./SignUpFormFields";
import { registerUser } from "@/services/auth/registerService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const { user } = useUser();

  // Check if superadmin exists
  useEffect(() => {
    const checkForSuperAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .single();
        
        if (!error && data) {
          setSuperAdminExists(true);
        }
      } catch (error) {
        // Fall back to localStorage check for development
        const existingUsers = localStorage.getItem("users");
        if (existingUsers) {
          const users = JSON.parse(existingUsers);
          const hasSuperAdmin = users.some((user: any) => user.role === "superadmin");
          setSuperAdminExists(hasSuperAdmin);
        }
      }
    };

    checkForSuperAdmin();
  }, []);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "property_manager",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if trying to create superadmin when one already exists
      if (data.role === "superadmin" && superAdminExists) {
        toast.error("Super Admin role already exists", {
          description: "Only one Super Admin account can be created.",
        });
        setIsLoading(false);
        return false;
      }

      // Register with Supabase
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
        }
      });

      if (error) {
        toast.error("Registration failed", {
          description: error.message,
        });
        return false;
      }

      toast.success("Account created successfully", {
        description: "Please check your email for verification link",
      });

      // For development, still register with the mock system too
      await registerUser(data, superAdminExists);
      
      // Reset form after successful submission
      form.reset();
      
      // If superadmin was created, update state
      if (data.role === "superadmin") {
        setSuperAdminExists(true);
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "There was an error creating your account. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SignUpFormFields form={form} superAdminExists={superAdminExists} />

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </div>
    </Form>
  );
};

export default SignUpForm;
