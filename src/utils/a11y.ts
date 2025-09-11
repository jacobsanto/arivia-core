/**
 * Accessibility utilities and hooks for WCAG 2.1 AA compliance
 */

import React from 'react';
import { logger } from '@/services/logger';

// Focus management utilities
export const useFocusManagement = () => {
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(',');

  const trapFocus = React.useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [focusableSelectors]);

  const restoreFocus = React.useCallback((previousActiveElement: Element | null) => {
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus();
    }
  }, []);

  return { trapFocus, restoreFocus };
};

// Announcement utilities for screen readers
export const useAnnouncements = () => {
  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    logger.debug('Screen reader announcement', { message, priority });
  }, []);

  return { announce };
};

// Keyboard navigation helpers
export const useKeyboardNavigation = () => {
  const handleArrowKeys = React.useCallback((
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const { key } = e;
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (key === 'ArrowDown') {
        newIndex = (currentIndex + 1) % items.length;
        e.preventDefault();
      } else if (key === 'ArrowUp') {
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        e.preventDefault();
      }
    } else {
      if (key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % items.length;
        e.preventDefault();
      } else if (key === 'ArrowLeft') {
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        e.preventDefault();
      }
    }

    if (key === 'Home') {
      newIndex = 0;
      e.preventDefault();
    } else if (key === 'End') {
      newIndex = items.length - 1;
      e.preventDefault();
    }

    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  }, []);

  return { handleArrowKeys };
};

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const checkHighContrast = () => {
      const isWinHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const hasForcedColors = window.matchMedia('(forced-colors: active)').matches;
      
      setIsHighContrast(isWinHighContrast || hasForcedColors);
    };

    checkHighContrast();

    const contrastMedia = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsMedia = window.matchMedia('(forced-colors: active)');

    contrastMedia.addEventListener('change', checkHighContrast);
    forcedColorsMedia.addEventListener('change', checkHighContrast);

    return () => {
      contrastMedia.removeEventListener('change', checkHighContrast);
      forcedColorsMedia.removeEventListener('change', checkHighContrast);
    };
  }, []);

  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};