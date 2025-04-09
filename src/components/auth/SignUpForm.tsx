
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { ROLE_DETAILS, UserRole } from "@/types/auth";

interface SignUpFormProps {
  isMobile?: boolean;
}

const SignUpForm = ({ isMobile = false }: SignUpFormProps) => {
  const navigate = useNavigate();
  const { register } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as UserRole,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setSignUpData(prev => ({
      ...prev,
      role: value as UserRole
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(
        signUpData.email, 
        signUpData.password, 
        signUpData.name, 
        signUpData.role
      );
      
      if (success) {
        toast.success("Registration successful");
        navigate("/");
      } else {
        toast.error("Registration failed");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          name="name"
          placeholder="John Doe" 
          value={signUpData.name} 
          onChange={handleChange}
          required
          className={isMobile ? "h-10" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email" 
          placeholder="name@example.com" 
          value={signUpData.email} 
          onChange={handleChange}
          required
          className={isMobile ? "h-10" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          name="password"
          type="password" 
          placeholder="••••••••" 
          value={signUpData.password} 
          onChange={handleChange}
          required
          minLength={8}
          className={isMobile ? "h-10" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters long
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={signUpData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger id="role" className={isMobile ? "h-10" : ""}>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_DETAILS)
              .filter(([key]) => key !== "superadmin") // Filter out superadmin
              .map(([key, { title }]) => (
                <SelectItem key={key} value={key}>
                  {title}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your role determines your access level in the system
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
