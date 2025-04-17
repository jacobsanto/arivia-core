
import React from 'react';
import MetricCard from './MetricCard';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardContainerProps {
  cards: any[];
  isLoading?: boolean;
  error?: string | null;
  onToggleFavorite?: (metricId: string) => void;
}

export const MetricCardContainer: React.FC<MetricCardContainerProps> = ({
  cards,
  isLoading = false,
  error = null,
  onToggleFavorite
}) => {
  // Show skeletons when loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-4 shadow-sm flex flex-col h-full">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="mt-auto">
              <Skeleton className="h-2 w-full mb-1" />
              <Skeleton className="h-2 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
        <h3 className="font-medium">Error loading metrics</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  // Show the metric cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <MetricCard 
          key={card.id} 
          metric={card} 
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(card.id) : undefined}
        />
      ))}
    </div>
  );
};
