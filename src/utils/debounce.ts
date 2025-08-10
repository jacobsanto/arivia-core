export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Auth-specific debounced functions
export const createDebouncedAuthRefresh = (delay: number = 1000) => 
  debounce((refreshFn: () => Promise<void>) => refreshFn(), delay);

export const createThrottledProfileFetch = (limit: number = 2000) =>
  throttle((fetchFn: (userId: string) => Promise<any>, userId: string) => fetchFn(userId), limit);