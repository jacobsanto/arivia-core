
import React, { useState } from "react";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { MetricCardProps } from "./MetricCard";

interface MetricCardContainerProps {
  cards: Array<Omit<MetricCardProps, 'swipeable'>>;
  renderCard: (card: Omit<MetricCardProps, 'swipeable'>, index: number) => React.ReactNode;
}

export const MetricCardContainer: React.FC<MetricCardContainerProps> = ({ 
  cards,
  renderCard
}) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = isMobile ? 2 : 3;
  
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  
  const visibleCards = isMobile 
    ? cards.slice(currentPage * cardsPerPage, (currentPage * cardsPerPage) + cardsPerPage)
    : cards;
    
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'right' && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  return (
    <div className="relative">
      <div className={`grid gap-3 md:gap-6 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {visibleCards.map((card, index) => renderCard(card, index))}
      </div>
      
      {isMobile && totalPages > 1 && (
        <div className="flex justify-center mt-2 gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div 
              key={`indicator-${i}`} 
              className={`h-1.5 rounded-full transition-all ${currentPage === i ? 'w-4 bg-primary' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </div>
      )}
      
      {isMobile && (
        <>
          {currentPage > 0 && (
            <SwipeIndicator 
              direction="right" 
              visible={true}
              className="top-1/2 -translate-y-1/2 left-1"
            />
          )}
          {currentPage < totalPages - 1 && (
            <SwipeIndicator 
              direction="left" 
              visible={true}
              className="top-1/2 -translate-y-1/2 right-1" 
            />
          )}
        </>
      )}
    </div>
  );
};
