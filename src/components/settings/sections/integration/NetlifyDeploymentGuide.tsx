
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const NetlifyDeploymentGuide: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-md">
              <img 
                src="https://www.netlify.com/v3/img/components/logomark.png"
                alt="Netlify Logo"
                className="w-8 h-8" 
              />
            </div>
            <div>
              <CardTitle className="text-lg">Netlify Deployment Guide</CardTitle>
              <CardDescription>Configure your Netlify deployment for integrations</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.open("https://netlify.com/", "_blank")}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" /> 
            Netlify Dashboard
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            To successfully deploy this application with active integrations on Netlify, you need to configure environment variables in your Netlify dashboard.
          </AlertDescription>
        </Alert>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="secondary" size="sm" className="w-full">
              {isOpen ? "Hide Configuration Instructions" : "Show Configuration Instructions"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-md border p-4 mt-4 space-y-4">
              <div>
                <h3 className="font-medium">1. Set Environment Variables</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Navigate to Site settings &gt; Environment variables in your Netlify dashboard and add the following:
                </p>
                <div className="bg-slate-50 rounded-md p-3 mt-2">
                  <pre className="text-xs overflow-x-auto">
                    <code>
                      GUESTY_USERNAME=your_guesty_username<br />
                      GUESTY_PASSWORD=your_guesty_password<br />
                      GUESTY_CLIENT_ID=your_guesty_client_id<br />
                      GUESTY_SECRET=your_guesty_client_secret<br />
                      STRIPE_SECRET_KEY=your_stripe_secret_key<br />
                      STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
                    </code>
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">2. Deploy Netlify Functions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ensure your netlify.toml file is configured properly for functions:
                </p>
                <div className="bg-slate-50 rounded-md p-3 mt-2">
                  <pre className="text-xs overflow-x-auto">
                    <code>
                      [build]<br />
                      {"  "}functions = "netlify/functions"<br /><br />

                      [[redirects]]<br />
                      {"  "}from = "/api/*"<br />
                      {"  "}to = "/.netlify/functions/:splat"<br />
                      {"  "}status = 200
                    </code>
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">3. Test Your Functions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Once deployed, test each integration by enabling them in the settings panel. Check Netlify function logs for any errors.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default NetlifyDeploymentGuide;
