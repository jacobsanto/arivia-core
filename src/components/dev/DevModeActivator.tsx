
import React, { useState, useCallback } from 'react';
import { useDevMode } from '@/contexts/DevModeContext';

interface DevModeActivatorProps {
  children: React.ReactNode;
  clicksRequired?: number;
}

export const DevModeActivator: React.FC<DevModeActivatorProps> = ({ 
  children, 
  clicksRequired = 7 
}) => {
  const { toggleDevMode, isDevMode } = useDevMode();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    // Reset count if more than 2 seconds between clicks
    if (timeDiff > 2000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(now);
    
    // Toggle dev mode if required clicks reached
    if (clickCount + 1 >= clicksRequired) {
      toggleDevMode();
      setClickCount(0);
      
      // Show brief notification
      if (!isDevMode) {
        const notification = document.createElement('div');
        notification.textContent = '🔧 Development Mode Activated';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    }
  }, [clickCount, lastClickTime, clicksRequired, toggleDevMode, isDevMode]);

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
};
