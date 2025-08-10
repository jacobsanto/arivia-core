import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  announcements: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',
  announcements: true,
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Check for user preferences
    const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const preferHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Load saved settings
    const saved = localStorage.getItem('accessibility-settings');
    const savedSettings = saved ? JSON.parse(saved) : {};
    
    return {
      ...defaultSettings,
      reducedMotion: preferReducedMotion,
      highContrast: preferHighContrast,
      ...savedSettings,
    };
  });

  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create screen reader announcer
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.classList.add('sr-only');
    announcerElement.id = 'a11y-announcer';
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (document.body.contains(announcerElement)) {
        document.body.removeChild(announcerElement);
      }
    };
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;
    
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-larger');
    root.classList.add(`font-size-${settings.fontSize}`);

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements || !announcer) return;
    
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, announce }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}