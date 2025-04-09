import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface SignUpFormProps {
  isMobile?: boolean;
}

const SignUpForm = ({ isMobile = false }: SignUpFormProps) => {
  const navigate = useNavigate();
  const { signup } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(signUpData.email, signUpData.password, signUpData.fullName);
      toast.success("Account created successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to create account");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          name="fullName"
          placeholder="John Doe" 
          value={signUpData.fullName} 
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input 
          id="confirmPassword" 
          name="confirmPassword"
          type="password" 
          placeholder="••••••••" 
          value={signUpData.confirmPassword} 
          onChange={handleChange}
          required
          minLength={8}
          className={isMobile ? "h-10" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Confirm your password
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
