import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from "lucide-react";

interface MVPLoginFormProps {
  onSwitchToSignUp: () => void;
}

export const MVPLoginForm: React.FC<MVPLoginFormProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Development mode check - only show dev accounts in development
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  const handleQuickLogin = async (email: string) => {
    if (!isDevelopment) return;
    
    setIsLoading(true);
    setError("");
    setEmail(email);
    
    // In development, just populate the email field - user still needs to enter password
    try {
      // No auto-login, just help with email
      setEmail(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Development helper failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Development Email Helper - Only in Development */}
      {isDevelopment && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Development Email Helper</span>
            </div>
            <p className="text-xs text-orange-700 mb-2">Click to populate email field (you still need to enter the password)</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => handleQuickLogin("superadmin@ariviavillas.com")}
                className="text-xs border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                Super Admin Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => handleQuickLogin("admin@ariviavillas.com")}
                className="text-xs border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                Administrator Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => handleQuickLogin("manager@ariviavillas.com")}
                className="text-xs border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                Property Manager Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Button 
          variant="link"
          className="p-0 h-auto"
          onClick={onSwitchToSignUp}
        >
          Sign up here
        </Button>
      </div>
    </div>
  );
};
