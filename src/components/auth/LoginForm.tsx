
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface LoginFormProps {
  isMobile?: boolean;
}

const LoginForm = ({ isMobile = false }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginData.email, loginData.password);
      
      if (success) {
        toast.success("Login successful");
        navigate("/");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email" 
          placeholder="name@example.com" 
          value={loginData.email} 
          onChange={handleChange}
          required
          className={isMobile ? "h-10" : ""}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-sm text-primary underline">
            Forgot password?
          </a>
        </div>
        <Input 
          id="password" 
          name="password"
          type="password" 
          placeholder="••••••••" 
          value={loginData.password} 
          onChange={handleChange}
          required
          className={isMobile ? "h-10" : ""}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      
      {/* Demo credentials - in a real app these would be removed */}
      {!isMobile && (
        <div className="text-sm text-center text-muted-foreground">
          <p>Demo credentials:</p>
          <p>Email: admin@example.com / Password: password</p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
