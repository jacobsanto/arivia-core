
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export const useSwipeHint = () => {
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const isMobile = useIsMobile();

  // Hide swipe hint after a few seconds
  useEffect(() => {
    if (showSwipeHint && isMobile) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint, isMobile]);

  // Show swipe toast message for first-time users
  useEffect(() => {
    if (isMobile) {
      const hasSeenSwipeTip = localStorage.getItem('seen_swipe_tip');
      if (!hasSeenSwipeTip) {
        toast("Swipe Tip", {
          description: "Swipe left or right to navigate between tabs.",
          duration: 5000,
          icon: "👆"
        });
        localStorage.setItem('seen_swipe_tip', 'true');
      }
    }
  }, [isMobile]);

  const resetSwipeHint = () => {
    setShowSwipeHint(true);
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  };

  return { showSwipeHint, isMobile, resetSwipeHint };
};
