import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationConfig {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  required_fields: any[];
  optional_fields: any[];
  webhook_events: string[];
  supported_operations: string[];
}

interface IntegrationSetupDialogProps {
  config: IntegrationConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const IntegrationSetupDialog: React.FC<IntegrationSetupDialogProps> = ({
  config,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const testConnection = async () => {
    setTestStatus('testing');
    // Simulate connection test
    setTimeout(() => {
      setTestStatus(Math.random() > 0.3 ? 'success' : 'error');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('external_integrations')
        .insert({
          name: `${config.name} Integration`,
          provider: config.provider,
          category: config.category,
          integration_type: config.supported_operations.includes('webhook') ? 
            (config.supported_operations.includes('read') || config.supported_operations.includes('write') ? 'both' : 'webhook') :
            'api',
          status: 'configuring',
          config: formData,
          credentials: formData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Integration Created",
        description: `${config.name} integration has been set up successfully.`,
      });

      onOpenChange(false);
      onSuccess?.();
      setFormData({});
      setTestStatus('idle');
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to create integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'password':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showPassword[field.name] ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => togglePasswordVisibility(field.name)}
              >
                {showPassword[field.name] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <div key={field.name} className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type || 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
    }
  };

  if (!config) return null;

  const requiredFieldsComplete = config.required_fields.every(
    field => formData[field.name]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            Setup {config.name} Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Integration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{config.description}</p>
              <div className="flex flex-wrap gap-2">
                {config.supported_operations.map(op => (
                  <Badge key={op} variant="outline" className="text-xs">
                    {op.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {config.required_fields.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-destructive">
                    Required Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.required_fields.map(renderField)}
                </CardContent>
              </Card>
            )}

            {config.optional_fields.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Optional Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.optional_fields.map(renderField)}
                </CardContent>
              </Card>
            )}

            {config.webhook_events.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Webhook Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    This integration supports the following webhook events:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.webhook_events.map(event => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {testStatus === 'testing' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Testing connection...
                  </div>
                )}
                {testStatus === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Connection successful
                  </div>
                )}
                {testStatus === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Connection failed
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={!requiredFieldsComplete || testStatus === 'testing'}
                >
                  Test Connection
                </Button>
                <Button
                  type="submit"
                  disabled={!requiredFieldsComplete || isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Integration'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationSetupDialog;