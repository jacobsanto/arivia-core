
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { signUpFormSchema, SignUpFormValues } from "@/lib/validation/auth-schema";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { SecurityEnhancements } from "./SecurityEnhancements";

interface SignUpFormProps {
  isMobile?: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ isMobile = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

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

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.name, values.role);
      // Show success message for email confirmation
      setShowSecurityInfo(true);
    } catch (error: any) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSecurityInfo) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Registration successful! Please check your email to confirm your account before signing in.
          </AlertDescription>
        </Alert>
        <SecurityEnhancements />
        <Button 
          onClick={() => navigate('/login')} 
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">Full Name</Label>
              <FormControl>
                <Input
                  id="name"
                  placeholder="Enter your full name"
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
                  placeholder="Choose a strong password (min 8 characters)"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <PasswordStrengthIndicator password={field.value} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <FormControl>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="property_manager">Property Manager</SelectItem>
                  <SelectItem value="concierge">Concierge</SelectItem>
                  <SelectItem value="housekeeping_staff">Housekeeping Staff</SelectItem>
                  <SelectItem value="maintenance_staff">Maintenance Staff</SelectItem>
                  <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            By registering, you agree to our enhanced security measures including email verification and strong password requirements.
          </AlertDescription>
        </Alert>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
