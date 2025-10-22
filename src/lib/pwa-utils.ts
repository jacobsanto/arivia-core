/**
 * PWA utility functions
 */

/**
 * Check if the app is running in standalone mode (installed)
 */
export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if the device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if the device is Android
 */
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Check if the device is mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get the platform (iOS, Android, or Desktop)
 */
export const getPlatform = (): 'ios' | 'android' | 'desktop' => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
};

/**
 * Check if PWA installation is supported
 */
export const canInstallPWA = (): boolean => {
  return 'beforeinstallprompt' in window || isIOS();
};

/**
 * Share content using Web Share API (if available)
 */
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  if (!('share' in navigator)) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.debug('Share cancelled or failed:', error);
    return false;
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

/**
 * Show a notification (if permission granted)
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });
  }
};
