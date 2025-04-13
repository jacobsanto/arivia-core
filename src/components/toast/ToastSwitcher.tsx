
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToastContext, useToastService } from '@/contexts/ToastContext';

export function ToastSwitcher() {
  const { implementation, setImplementation } = useToastContext();
  const toastService = useToastService();
  
  const toggleImplementation = () => {
    const newImplementation = implementation === 'sonner' ? 'shadcn' : 'sonner';
    setImplementation(newImplementation);
    
    // Show a toast with the new implementation
    toastService.success(`Switched to ${newImplementation} toasts`, {
      description: `You're now using the ${newImplementation} toast implementation`
    });
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleImplementation}
      className="flex items-center gap-2"
    >
      {implementation === 'sonner' ? 'Using Sonner' : 'Using Shadcn UI'}
    </Button>
  );
}
