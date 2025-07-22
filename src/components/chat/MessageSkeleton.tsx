import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

interface MessageSkeletonListProps {
  count?: number;
}

export const MessageSkeletonList: React.FC<MessageSkeletonListProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  );
};