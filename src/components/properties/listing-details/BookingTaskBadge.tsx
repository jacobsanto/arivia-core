
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Loader2 } from 'lucide-react';

interface BookingTaskBadgeProps {
  status: string;
}

export const BookingTaskBadge: React.FC<BookingTaskBadgeProps> = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'done':
    case 'completed':
      return (
        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
          <Check className="h-3 w-3 mr-1" /> Cleaning Completed
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
          <Loader2 className="h-3 w-3 animate-spin mr-1" /> Cleaning In Progress
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200">
          <Clock className="h-3 w-3 mr-1" /> Cleaning Scheduled
        </Badge>
      );
  }
};
