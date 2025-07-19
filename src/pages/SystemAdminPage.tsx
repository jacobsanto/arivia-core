import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemMonitoring from '@/components/monitoring/SystemMonitoring';
import SecurityCenter from '@/components/admin/SecurityCenter';
import BackupRestore from '@/components/admin/BackupRestore';

const SystemAdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health, manage security, and configure backups
          </p>
        </div>

        <Tabs defaultValue="monitoring" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security Center</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="security">
            <SecurityCenter />
          </TabsContent>

          <TabsContent value="backup">
            <BackupRestore />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemAdminPage;