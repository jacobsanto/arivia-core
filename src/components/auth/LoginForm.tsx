import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface LoginFormProps {
  isMobile?: boolean;
}

const LoginForm = ({ isMobile = false }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!loginData.email || !loginData.password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Submitting login for: ${loginData.email} (${Date.now()})`);
      
      await login(loginData.email, loginData.password);
      
      // If login doesn't throw an error, we can assume it was successful
      toast.success("Login successful");
      console.log("Login successful, navigating to dashboard");
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login form error:", error);
      
      // Handle different error types
      let errorMessage = "An unexpected error occurred during login";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Network error detection
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        // Authentication errors
        if (error.message.includes("Invalid email") || 
            error.message.includes("Invalid login") || 
            error.message.includes("Invalid password") ||
            error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
          disabled={isLoading}
          autoComplete="username"
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
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : "Sign in"}
      </Button>
      
      {/* Demo credentials - in a real app these would be removed */}
      {!isMobile && (
        <div className="text-sm text-center text-muted-foreground">
          <p>Demo credentials:</p>
          <p>Email: admin@ariviavillas.com / Password: password</p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
