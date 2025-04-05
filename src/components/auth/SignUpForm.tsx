
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum([
    "administrator", 
    "property_manager", 
    "concierge", 
    "housekeeping_staff", 
    "maintenance_staff", 
    "inventory_manager",
    "superadmin"
  ] as const)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "property_manager",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Check if trying to create superadmin when one already exists
      if (data.role === "superadmin" && superAdminExists) {
        toast.error("Super Admin role already exists", {
          description: "Only one Super Admin account can be created.",
        });
        setIsLoading(false);
        return;
      }

      // In a real app, this would be an API call to register the user
      console.log("Registration data:", data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Store user in localStorage for demo purposes
      const newUser = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: "/placeholder.svg"
      };

      // Update existing users or create new array
      const existingUsers = localStorage.getItem("users");
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // If superadmin was created, update state
      if (data.role === "superadmin") {
        setSuperAdminExists(true);
      }
      
      toast.success("Account created successfully", {
        description: "You can now sign in with your credentials",
      });
      
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "There was an error creating your account. Please try again.",
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
                <Input placeholder="you@example.com" type="email" {...field} />
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
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
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="property_manager">Property Manager</SelectItem>
                  <SelectItem value="concierge">Concierge</SelectItem>
                  <SelectItem value="housekeeping_staff">Housekeeping Staff</SelectItem>
                  <SelectItem value="maintenance_staff">Maintenance Staff</SelectItem>
                  <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                  {!superAdminExists && (
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {superAdminExists && field.value === "superadmin" && (
                <p className="text-sm text-destructive mt-1">
                  Super Admin role is already taken
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
