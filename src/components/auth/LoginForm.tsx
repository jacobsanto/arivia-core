
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { AlertCircle, Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
  isMobile?: boolean;
}

const LoginForm = ({ isMobile = false }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="email" className="block font-medium">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={handleChange}
            required
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block font-medium">Password</label>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange}
            required
            className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex items-center">
        <Checkbox 
          id="rememberMe" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(!!checked)} 
          className="border-gray-400"
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm">Remember me</label>
      </div>
      
      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
            Signing in...
          </>
        ) : "Login"}
      </button>
      
      {/* Only show demo credentials when not on mobile */}
      {!isMobile && (
        <div className="text-sm text-center text-muted-foreground mt-6">
          <p>Demo credentials:</p>
          <p>Email: admin@ariviavillas.com / Password: password</p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
