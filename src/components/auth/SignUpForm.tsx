
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { AlertCircle, Loader2, User, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignUpFormProps {
  isMobile?: boolean;
}

const SignUpForm = ({ isMobile = false }: SignUpFormProps) => {
  const navigate = useNavigate();
  const { signup } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "property_manager"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError(null);
  };

  const handleRoleChange = (value: string) => {
    setSignUpData(prev => ({
      ...prev,
      role: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!signUpData.fullName || !signUpData.email || !signUpData.password) {
      setError("All fields are required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signup(signUpData.email, signUpData.password, signUpData.fullName);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create account");
      }
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
        <label htmlFor="fullName" className="block font-medium">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            id="fullName" 
            name="fullName"
            placeholder="John Smith" 
            value={signUpData.fullName} 
            onChange={handleChange}
            required
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="username" className="block font-medium">Username</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            id="username" 
            name="username"
            placeholder="johnsmith" 
            value={signUpData.username} 
            onChange={handleChange}
            required
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="block font-medium">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            id="email" 
            name="email"
            type="email" 
            placeholder="john.smith@example.com" 
            value={signUpData.email} 
            onChange={handleChange}
            required
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="block font-medium">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            id="password" 
            name="password"
            type={showPassword ? "text" : "password"} 
            placeholder="Create a password" 
            value={signUpData.password} 
            onChange={handleChange}
            required
            minLength={8}
            className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
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
      
      <div className="space-y-2">
        <label htmlFor="role" className="block font-medium">Role</label>
        <div className="relative">
          <Select
            value={signUpData.role}
            onValueChange={handleRoleChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property_manager">Property Manager</SelectItem>
              <SelectItem value="housekeeping_staff">Housekeeping</SelectItem>
              <SelectItem value="maintenance_staff">Maintenance</SelectItem>
              <SelectItem value="concierge">Concierge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition-colors mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
            Creating account...
          </>
        ) : "Register"}
      </button>
    </form>
  );
};

export default SignUpForm;
