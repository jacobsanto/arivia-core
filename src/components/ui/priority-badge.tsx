
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

const priorityConfig = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800' }
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const config = priorityConfig[priority];
  
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
