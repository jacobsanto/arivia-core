
import React from "react";
import MetricCard from "./MetricCard";
import { MetricCardProps } from "./createMetricCards";

interface MetricCardContainerProps {
  cards: MetricCardProps[];
  className?: string;
}

export const MetricCardContainer: React.FC<MetricCardContainerProps> = ({
  cards,
  className = ""
}) => {
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
        />
      ))}
    </div>
  );
};
