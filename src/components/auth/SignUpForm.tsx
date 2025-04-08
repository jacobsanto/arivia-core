
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signUpFormSchema, SignUpFormValues } from "@/lib/validation/auth-schema";
import { useUser } from "@/contexts/UserContext";
import SignUpFormFields from "./SignUpFormFields";
import { registerUser } from "@/services/auth/registerService";

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const { user } = useUser();

  // Check if superadmin exists in mock data
  useEffect(() => {
    // In a real app, this would be an API call to check if superadmin exists
    // For demo purposes, we'll check localStorage
    const existingUsers = localStorage.getItem("users");
    if (existingUsers) {
      const users = JSON.parse(existingUsers);
      const hasSuperAdmin = users.some((user: any) => user.role === "superadmin");
      setSuperAdminExists(hasSuperAdmin);
    }
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
    
    const success = await registerUser(data, superAdminExists);
    
    if (success) {
      // Reset form after successful submission
      form.reset();
      
      // If superadmin was created, update state
      if (data.role === "superadmin") {
        setSuperAdminExists(true);
      }
    }
    
    setIsLoading(false);
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
