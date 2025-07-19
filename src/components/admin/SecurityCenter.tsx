import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityConfig {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  auditLogging: boolean;
  dataEncryption: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

const SecurityCenter = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SecurityConfig>({
    twoFactorEnabled: true,
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireSpecialChars: true,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    auditLogging: true,
    dataEncryption: true
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Mobile App API',
      key: 'ak_live_1234567890abcdef',
      permissions: ['read:properties', 'write:tasks'],
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(),
      expiresAt: new Date('2025-01-15'),
      isActive: true
    },
    {
      id: '2',
      name: 'Integration Service',
      key: 'ak_live_fedcba0987654321',
      permissions: ['read:all', 'write:bookings'],
      createdAt: new Date('2024-02-01'),
      lastUsed: new Date('2024-12-10'),
      expiresAt: null,
      isActive: true
    }
  ]);

  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  const updateConfig = (key: keyof SecurityConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Security settings updated",
      description: `${key} has been updated successfully.`
    });
  };

  const generateApiKey = () => {
    if (!newApiKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key.",
        variant: "destructive"
      });
      return;
    }

    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newApiKeyName,
      key: `ak_live_${Math.random().toString(36).substr(2, 16)}`,
      permissions: ['read:properties'],
      createdAt: new Date(),
      lastUsed: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewApiKeyName('');
    
    toast({
      title: "API Key generated",
      description: `New API key "${newKey.name}" has been created.`
    });
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, isActive: false } : key
    ));
    
    toast({
      title: "API Key revoked",
      description: "The API key has been revoked successfully.",
      variant: "destructive"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard."
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      securityConfig: config,
      apiKeys: apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        permissions: key.permissions,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        isActive: key.isActive
      }))
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Security report exported",
      description: "Security configuration has been exported successfully."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <Switch
                    id="2fa"
                    checked={config.twoFactorEnabled}
                    onCheckedChange={(checked) => updateConfig('twoFactorEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => updateConfig('sessionTimeout', parseInt(e.target.value))}
                    min="1"
                    max="168"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-length">Minimum Password Length</Label>
                  <Input
                    id="password-length"
                    type="number"
                    value={config.passwordMinLength}
                    onChange={(e) => updateConfig('passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="special-chars">Require Special Characters</Label>
                  <Switch
                    id="special-chars"
                    checked={config.requireSpecialChars}
                    onCheckedChange={(checked) => updateConfig('requireSpecialChars', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={config.maxLoginAttempts}
                    onChange={(e) => updateConfig('maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="audit-logging">Audit Logging</Label>
                  <Switch
                    id="audit-logging"
                    checked={config.auditLogging}
                    onCheckedChange={(checked) => updateConfig('auditLogging', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="data-encryption">Data Encryption</Label>
                  <Switch
                    id="data-encryption"
                    checked={config.dataEncryption}
                    onCheckedChange={(checked) => updateConfig('dataEncryption', checked)}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={exportSecurityReport} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Security Report
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">API Key Management</h3>
              <Badge variant="secondary">
                {apiKeys.filter(key => key.isActive).length} active keys
              </Badge>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter API key name"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={generateApiKey}>
                <Key className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </div>

            <div className="space-y-3">
              {apiKeys.map(apiKey => (
                <Card key={apiKey.id} className={!apiKey.isActive ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant={apiKey.isActive ? 'default' : 'destructive'}>
                          {apiKey.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {apiKey.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeApiKey(apiKey.id)}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="font-mono text-xs bg-muted p-2 rounded">
                        {showKeys[apiKey.id] ? apiKey.key : '•'.repeat(apiKey.key.length)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                        <div>
                          <span>Created: {apiKey.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span>Last used: {apiKey.lastUsed?.toLocaleDateString() || 'Never'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security Status */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Security Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">SSL Certificate</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Valid until: March 15, 2025
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Database Encryption</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AES-256 encryption enabled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Backup Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last backup: 2 hours ago
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Firewall Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All ports secured
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityCenter;