
import React from "react";
import MetricCard from "./MetricCard";
import { MetricCardProps } from "./createMetricCards";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardContainerProps {
  cards: MetricCardProps[];
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  onToggleFavorite?: (metricId: string) => void;
}

export const MetricCardContainer: React.FC<MetricCardContainerProps> = ({
  cards,
  className = "",
  isLoading = false,
  error = null,
  onToggleFavorite
}) => {
  if (error) {
    return (
      <div className={`grid grid-cols-1 gap-4 ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {cards.map((card, index) => (
        <MetricCard
          key={`${card.title}-${index}`}
          title={card.title}
          value={card.value}
          trend={card.trend}
          icon={card.icon}
          color={card.color}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(card.title) : undefined}
        />
      ))}
    </div>
  );
};
