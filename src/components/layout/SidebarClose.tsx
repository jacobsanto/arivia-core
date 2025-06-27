
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarCloseProps {
  onClose: () => void;
}

export const SidebarClose: React.FC<SidebarCloseProps> = ({ onClose }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className="h-8 w-8"
      aria-label="Close sidebar"
    >
      <X className="h-4 w-4" />
    </Button>
  );
};
