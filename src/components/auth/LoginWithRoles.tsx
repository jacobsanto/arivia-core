import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/auth/UserContext";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LOGIN_DEMO_CREDENTIALS = [
  { role: "Administrator", email: "admin@ariviavillas.com", password: "admin123" },
  { role: "Property Manager", email: "manager@ariviavillas.com", password: "manager123" },
  { role: "Concierge", email: "concierge@ariviavillas.com", password: "concierge123" },
  { role: "Housekeeping", email: "housekeeping@ariviavillas.com", password: "housekeeping123" },
  { role: "Maintenance", email: "maintenance@ariviavillas.com", password: "maintenance123" },
  { role: "Inventory Manager", email: "inventory@ariviavillas.com", password: "inventory123" },
  { role: "Super Admin", email: "superadmin@ariviavillas.com", password: "superadmin123" },
];

const LoginWithRoles: React.FC = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error) {
      // Handle login error (e.g., display error message)
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      // Handle login error (e.g., display error message)
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Input
          id="password"
          type="password"
          placeholder="Password"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>
      <Button disabled={isLoading} className="w-full" type="submit">
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="py-2 text-sm text-muted-foreground">
        Or sign in with a demo account:
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {LOGIN_DEMO_CREDENTIALS.map((credential) => (
          <Button
            key={credential.role}
            type="button"
            variant={selectedRole === credential.role ? "default" : "outline"}
            onClick={() => {
              setSelectedRole(credential.role);
              handleDemoLogin(credential.email, credential.password);
            }}
            disabled={isLoading}
          >
            {credential.role}
          </Button>
        ))}
      </div>
    </form>
  );
};

export default LoginWithRoles;
