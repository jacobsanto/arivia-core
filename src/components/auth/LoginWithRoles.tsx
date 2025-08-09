
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DETAILS, UserRole } from "@/types/auth";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const LoginWithRoles: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Define demo accounts for quick login
  const demoAccounts = [
    { role: "superadmin" as UserRole, email: "superadmin@ariviavillas.com", password: "superadmin123" },
    { role: "administrator" as UserRole, email: "admin@ariviavillas.com", password: "admin123" },
    { role: "property_manager" as UserRole, email: "manager@ariviavillas.com", password: "manager123" },
    { role: "housekeeping_staff" as UserRole, email: "housekeeping@ariviavillas.com", password: "housekeeping123" },
  ];

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
      
      // Get the redirect path from location state or default to "/"
      const from = location.state?.from?.pathname || "/";
      navigate(from);
      
      toast.success("Login successful", {
        description: "Welcome back to Arivia Villa Sync",
      });
    } catch (error) {
      toast.error("Login failed", {
        description: "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoAccount: typeof demoAccounts[0]) => {
    try {
      setIsLoading(true);
      await signIn(demoAccount.email, demoAccount.password);
      
      const from = location.state?.from?.pathname || "/";
      navigate(from);
      
      toast.success(`Logged in as ${ROLE_DETAILS[demoAccount.role].title}`, {
        description: "This is a demo account for testing",
      });
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your-email@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8">
        <h3 className="text-sm font-medium text-center mb-3">Demo Accounts</h3>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <Button
              key={account.role}
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleDemoLogin(account)}
              className="text-xs"
            >
              Login as {ROLE_DETAILS[account.role].title}
            </Button>
          ))}
        </div>
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Click any button above to sign in with a demo account
        </p>
      </div>
    </div>
  );
};

export default LoginWithRoles;
