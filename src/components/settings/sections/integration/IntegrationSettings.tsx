
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Settings, Check, Loader2, AlertTriangle, Wifi, WifiOff, Timer } from "lucide-react";
import { guestyService } from "@/services/guesty/guesty.service";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import GuestyPropertyList from "./integrations/guesty/GuestyPropertyList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Define a type for the connection status to ensure type safety
type ConnectionStatus = 'idle' | 'success' | 'error' | 'rate-limited' | 'auth-error' | 'server-error';

const IntegrationSettings = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check API status initially
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Countdown timer for retry
  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;
    
    const timer = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev === null || prev <= 1) {
          // If countdown reaches zero, clear status if it was rate-limited
          if (connectionStatus === 'rate-limited') {
            setConnectionStatus('idle');
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [retryCountdown, connectionStatus]);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const status = await guestyService.checkGuestyStatus();
      setApiStatus(status.guesty_status === 'available' ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const testGuestyConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage(null);
    setRetryCountdown(null);
    
    try {
      // First check API status
      await checkApiStatus();
      
      if (apiStatus === 'offline') {
        setConnectionStatus('error');
        setErrorMessage("Guesty API is currently unavailable. Please try again later.");
        toast.error("Guesty API Unavailable", {
          description: "Could not connect to Guesty API. Please try again later."
        });
        setIsTestingConnection(false);
        return;
      }
      
      // If API is available, try to get a token
      await guestyService.ensureValidToken();
      setConnectionStatus('success');
      toast.success("Guesty connection successful", {
        description: "Successfully authenticated with Guesty API"
      });
    } catch (error) {
      console.error("Guesty connection test failed:", error);
      
      // Check for rate limiting
      if (error instanceof Error && error.message.includes("Rate limit")) {
        setConnectionStatus('rate-limited');
        
        // Extract retry time from error message
        const match = error.message.match(/try again in (\d+) seconds/);
        const waitTime = match ? parseInt(match[1], 10) : 60;
        
        setRetryCountdown(waitTime);
        setErrorMessage(`Rate limit exceeded. Please try again in ${waitTime} seconds.`);
        
        toast.error("Guesty rate limit reached", {
          description: `Too many requests. Please wait ${waitTime} seconds before trying again.`
        });
      }
      // Check for authentication errors
      else if (error instanceof Error && error.message.includes("Authentication failed")) {
        setConnectionStatus('auth-error');
        setErrorMessage("Invalid credentials. Please check your Guesty API credentials in Supabase secrets.");
        
        toast.error("Guesty authentication failed", {
          description: "Invalid credentials. Please check your API keys."
        });
      }
      // Check for server errors
      else if (error instanceof Error && (
        error.message.includes("server") || 
        error.message.includes("experiencing issues")
      )) {
        setConnectionStatus('server-error');
        setErrorMessage("Guesty servers are experiencing issues. Please try again later.");
        setRetryCountdown(300); // 5 minute retry for server errors
        
        toast.error("Guesty server error", {
          description: "Guesty API is experiencing issues. Please try again later."
        });
      }
      // Generic errors
      else {
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : "Could not connect to Guesty API");
        
        toast.error("Guesty connection failed", {
          description: error instanceof Error ? error.message : "Could not connect to Guesty API"
        });
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConnectionButtonState = () => {
    if (isTestingConnection) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Testing...
        </>
      );
    }
    
    if (connectionStatus === 'success') {
      return (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Connected
        </>
      );
    }
    
    if (retryCountdown !== null && retryCountdown > 0) {
      return (
        <>
          <Timer className="h-4 w-4 mr-2" />
          Retry in {retryCountdown}s
        </>
      );
    }
    
    // Default state
    return (
      <>
        {apiStatus === 'online' ? (
          <Wifi className="h-4 w-4 mr-2 text-green-500" />
        ) : apiStatus === 'offline' ? (
          <WifiOff className="h-4 w-4 mr-2 text-amber-500" />
        ) : null}
        Test Connection
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Configuring Integrations</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect with external services to extend your application's functionality.
                  Currently supporting Guesty for property management integration.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Guesty Integration</h3>
            
            {connectionStatus === 'rate-limited' && (
              <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Rate Limit Reached</AlertTitle>
                <AlertDescription>
                  {errorMessage || "Rate limit exceeded. Please wait before trying again."}
                  {retryCountdown !== null && retryCountdown > 0 && (
                    <div className="mt-2 space-y-2">
                      <Progress value={retryCountdown} max={60} className="h-1" />
                      <div className="text-xs">
                        Auto-retry in {retryCountdown} seconds
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'auth-error' && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || "Invalid credentials. Please check your Guesty API credentials."}
                  <div className="mt-2 text-xs">
                    Verify that GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET are correctly set in your Supabase secrets.
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'server-error' && (
              <Alert variant="destructive" className="bg-orange-50 text-orange-800 border-orange-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Guesty Server Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || "Guesty servers are experiencing issues. Please try again later."}
                  {retryCountdown !== null && retryCountdown > 0 && (
                    <div className="mt-2 space-y-2">
                      <Progress value={retryCountdown} max={300} className="h-1" />
                      <div className="text-xs">
                        Auto-retry available in {retryCountdown} seconds
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {/* FIX: Changed the condition to use the defined ConnectionStatus type correctly */}
            {connectionStatus === 'error' && errorMessage && connectionStatus !== 'auth-error' && connectionStatus !== 'server-error' && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between items-center space-x-4 rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Guesty API Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Test your connection to the Guesty API
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={testGuestyConnection} 
                disabled={isTestingConnection || (retryCountdown !== null && retryCountdown > 0)}
                className="shrink-0"
              >
                {getConnectionButtonState()}
              </Button>
            </div>
            
            {connectionStatus === 'success' && (
              <Button 
                variant="secondary" 
                onClick={() => setShowPropertyList(!showPropertyList)}
                className="w-full"
              >
                {showPropertyList ? 'Hide Properties' : 'Show Properties'}
              </Button>
            )}
            
            {showPropertyList && connectionStatus === 'success' && (
              <GuestyPropertyList />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
