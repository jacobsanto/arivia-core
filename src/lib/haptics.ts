/**
 * Haptic feedback utilities for mobile devices
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback (if supported by the device)
 */
export const haptic = (style: HapticStyle = 'light') => {
  // Check if vibration API is available
  if (!('vibrate' in navigator)) {
    return;
  }

  // Map haptic styles to vibration patterns
  const patterns: Record<HapticStyle, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    selection: 5,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 100, 30, 100, 30],
  };

  try {
    navigator.vibrate(patterns[style]);
  } catch (error) {
    // Silently fail if vibration is not supported
    console.debug('Haptic feedback not supported:', error);
  }
};

/**
 * Cancel any ongoing vibrations
 */
export const cancelHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
};
