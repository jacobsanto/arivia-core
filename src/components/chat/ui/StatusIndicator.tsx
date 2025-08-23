import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  className,
  size = 'md'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-2 w-2';
      case 'lg':
        return 'h-4 w-4';
      case 'md':
      default:
        return 'h-3 w-3';
    }
  };

  return (
    <div
      className={cn(
        'rounded-full border-2 border-background',
        getStatusColor(),
        getSizeClass(),
        className
      )}
      title={`Status: ${status}`}
    />
  );
};