
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsMobile } from './use-mobile';

export const useMobileDashboard = (dashboardData: any) => {
  const isMobile = useIsMobile();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleItems, setVisibleItems] = useState(5);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Optimize initial load for mobile
  useEffect(() => {
    if (isMobile) {
      // Start with fewer items on mobile
      setVisibleItems(5);
    } else {
      // Show all items on desktop
      setVisibleItems(dashboardData?.housekeepingTasks?.length || 0);
    }
  }, [isMobile, dashboardData]);

  // Load more data with debounce
  const loadMore = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Add small delay for UX feedback
    setTimeout(() => {
      setVisibleItems(prev => prev + 5);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore]);

  // Set up intersection observer for infinite scroll capability
  useEffect(() => {
    if (!isMobile) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setHasScrolledToBottom(true);
        }
      },
      { threshold: 0.5 }
    );

    const bottomSentinel = document.getElementById('scroll-sentinel');
    if (bottomSentinel) observer.observe(bottomSentinel);

    return () => {
      if (bottomSentinel) observer.unobserve(bottomSentinel);
    };
  }, [isMobile, isLoadingMore]);

  // Calculate whether there are more items to load
  const hasMoreItems = useMemo(() => {
    const totalItems = dashboardData?.housekeepingTasks?.length || 0;
    return totalItems > visibleItems;
  }, [dashboardData, visibleItems]);

  return {
    visibleItems,
    isLoadingMore,
    loadMore,
    hasMoreItems,
    hasScrolledToBottom,
    isMobile
  };
};
