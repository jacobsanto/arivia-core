
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "@/lib/validation/auth-schema";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRoleBasedRoute } from "@/lib/utils/routing";
import { safeRoleCast } from "@/types/auth/base";

interface LoginFormProps {
  isMobile?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ isMobile = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use react-hook-form with zod for validation
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Call signIn function from UserContext (uses Supabase)
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
      
      // Get redirect path from location state or use role-based routing
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Let the UserContext handle redirect after profile is loaded
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email</Label>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  disabled={isLoading}
                />
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
              <Label htmlFor="password">Password</Label>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
