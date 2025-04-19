
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useMobileDashboard = (dashboardData: any) => {
  const isMobile = useIsMobile();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleItems, setVisibleItems] = useState(5);

  // Optimize initial load for mobile
  useEffect(() => {
    if (isMobile) {
      // Start with fewer items on mobile
      setVisibleItems(5);
    } else {
      // Show all items on desktop
      setVisibleItems(dashboardData?.length || 0);
    }
  }, [isMobile, dashboardData]);

  const loadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setVisibleItems(prev => prev + 5);
      setIsLoadingMore(false);
    }, 300);
  };

  return {
    visibleItems,
    isLoadingMore,
    loadMore,
    isMobile
  };
};
