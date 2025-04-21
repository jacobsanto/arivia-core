
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Settings, Check, Loader2, AlertTriangle } from "lucide-react";
import { guestyService } from "@/services/guesty/guesty.service";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import GuestyPropertyList from "./integrations/guesty/GuestyPropertyList";
import { Alert, AlertDescription } from "@/components/ui/alert";

const IntegrationSettings = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'rate-limited'>('idle');
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testGuestyConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage(null);
    
    try {
      await guestyService.ensureValidToken();
      setConnectionStatus('success');
      toast.success("Guesty connection successful", {
        description: "Successfully authenticated with Guesty API"
      });
    } catch (error) {
      console.error("Guesty connection test failed:", error);
      
      // Check for rate limiting
      if (error instanceof Error && 
          (error.message.includes("Too many requests") || 
           error.message.includes("Rate limit exceeded") || 
           error.message.includes("429"))) {
        setConnectionStatus('rate-limited');
        setErrorMessage("Rate limit exceeded. Please try again in a few minutes.");
        toast.error("Guesty rate limit reached", {
          description: "Too many requests. Please wait before trying again."
        });
      } else {
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
                <AlertDescription>
                  {errorMessage || "Rate limit exceeded. Please wait before trying again."}
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'error' && errorMessage && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
                <AlertTriangle className="h-4 w-4" />
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
                disabled={isTestingConnection}
                className="shrink-0"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : connectionStatus === 'success' ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Connected
                  </>
                ) : connectionStatus === 'rate-limited' ? (
                  'Retry Later'
                ) : (
                  'Test Connection'
                )}
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
