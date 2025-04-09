
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { offlineManager } from '@/utils/offlineManager';

const Troubleshooting = () => {
  const { toast } = useToast();
  
  const testToast = () => {
    toast({
      title: "Toast test",
      description: "This is a test toast notification",
    });
  };

  const testErrorToast = () => {
    toast({
      title: "Error toast",
      description: "This is a test error toast notification",
      variant: "destructive",
    });
  };
  
  const resetLocalStorage = () => {
    try {
      // Instead of using clearOfflineData which doesn't exist, remove the storage directly
      localStorage.removeItem(offlineManager["STORAGE_KEY"]);
      
      toast({
        title: "Storage reset",
        description: "All offline data has been cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset storage",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Troubleshooting</h1>
        <p className="text-muted-foreground">Tools to help diagnose and fix issues</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Interface Tests</CardTitle>
            <CardDescription>Test UI components and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={testToast}>Test Toast</Button>
              <Button variant="destructive" onClick={testErrorToast}>Test Error Toast</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Reset or repair application data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={resetLocalStorage}>Reset Offline Data</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Force Refresh</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Troubleshooting;
