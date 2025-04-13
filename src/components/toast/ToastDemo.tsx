
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToastService } from '@/contexts/ToastContext';
import { ToastSwitcher } from './ToastSwitcher';

export function ToastDemo() {
  const toast = useToastService();
  
  const showDefaultToast = () => {
    toast.show('Default Toast', { 
      description: 'This is a default toast notification' 
    });
  };
  
  const showSuccessToast = () => {
    toast.success('Success!', { 
      description: 'Operation completed successfully' 
    });
  };
  
  const showErrorToast = () => {
    toast.error('Error!', { 
      description: 'Something went wrong' 
    });
  };
  
  const showWarningToast = () => {
    toast.warning('Warning', { 
      description: 'This action might cause issues' 
    });
  };
  
  const showInfoToast = () => {
    toast.info('Information', { 
      description: 'Here is some useful information' 
    });
  };
  
  const showLoadingToast = () => {
    const id = toast.loading('Loading...', { 
      description: 'Please wait while we process your request' 
    });
    
    setTimeout(() => {
      toast.dismiss(id);
      toast.success('Loaded!', { 
        description: 'Your request has been processed successfully' 
      });
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Toast Demo</CardTitle>
        <CardDescription>Test different toast notifications</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button onClick={showDefaultToast}>Default</Button>
        <Button onClick={showSuccessToast} className="bg-green-600 hover:bg-green-700">Success</Button>
        <Button onClick={showErrorToast} variant="destructive">Error</Button>
        <Button onClick={showWarningToast} className="bg-amber-500 hover:bg-amber-600">Warning</Button>
        <Button onClick={showInfoToast} className="bg-blue-500 hover:bg-blue-600">Info</Button>
        <Button onClick={showLoadingToast} className="bg-purple-600 hover:bg-purple-700">Loading</Button>
      </CardContent>
      <CardFooter className="flex justify-between">
        <ToastSwitcher />
      </CardFooter>
    </Card>
  );
}
