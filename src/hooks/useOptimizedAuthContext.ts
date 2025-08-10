import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { deduplicateRequest } from '@/utils/authOptimizer';
import { profileFetchCircuitBreaker, authCircuitBreaker } from '@/utils/circuitBreaker';
import { debounce } from '@/utils/debounce';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';
import { toastService } from '@/services/toast';
import { logger } from '@/services/logger';

interface CachedProfile {
  data: any;
  timestamp: number;
  error?: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, CachedProfile>();

export const useOptimizedAuthContext = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logRequest } = useEgressMonitor();
  
  // Use refs to prevent infinite loops in effects
  const authStateRef = useRef({ user, session });
  authStateRef.current = { user, session };

  const fetchProfileWithOptimization = useCallback(async (userId: string) => {
    return deduplicateRequest(`profile-${userId}`, async () => {
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (cached.error) {
          logger.debug('AuthContext', 'Using cached profile error', { error: cached.error });
          return null;
        }
        return cached.data;
      }

      return profileFetchCircuitBreaker.execute(async () => {
        const startTime = Date.now();
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          const requestSize = JSON.stringify(data || {}).length;
          logRequest(requestSize, !!error);

          if (error) {
            logger.error('AuthContext', 'Profile fetch error', { error: error.message });
            
            // Cache the error to prevent repeated failed requests
            profileCache.set(userId, {
              data: null,
              timestamp: Date.now(),
              error: error.message
            });
            
            return null;
          }

          // Cache successful response
          profileCache.set(userId, {
            data,
            timestamp: Date.now()
          });
          
          logger.debug('AuthContext', 'Profile fetched successfully', { 
            userId, 
            duration: Date.now() - startTime 
          });
          
          return data;
        } catch (networkError) {
          logger.error('AuthContext', 'Network error fetching profile', { error: networkError });
          logRequest(0, true);
          return null;
        }
      });
    });
  }, [logRequest]);

  const buildUserFromProfile = useCallback((supabaseUser: any, profile: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
      role: (profile?.role as UserRole) || 'property_manager',
      avatar: profile?.avatar || "/placeholder.svg",
      phone: profile?.phone,
      secondaryRoles: profile?.secondary_roles ? 
        profile.secondary_roles.map((role: string) => role as UserRole) : undefined,
      customPermissions: profile?.custom_permissions as Record<string, boolean> || {}
    };
  }, []);

  const refreshAuthState = useCallback(async () => {
    const runRefresh = async () => {
      try {
        logger.debug('AuthContext', 'Refreshing auth state');
        setError(null);
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        const requestSize = JSON.stringify(data).length;
        logRequest(requestSize, false);
        
        setSession(data.session);
        
        if (data.session?.user) {
          const profile = await fetchProfileWithOptimization(data.session.user.id);
          if (profile) {
            const newUser = buildUserFromProfile(data.session.user, profile);
            setUser(newUser);
            logger.debug('AuthContext', 'User loaded successfully', { 
              name: newUser.name, 
              role: newUser.role 
            });
          } else {
            // Create a basic user even if profile fetch fails
            const basicUser = buildUserFromProfile(data.session.user, null);
            setUser(basicUser);
            logger.warn('AuthContext', 'Profile fetch failed, using basic user data');
          }
        } else {
          logger.debug('AuthContext', 'No session found');
          setUser(null);
        }
      } catch (err) {
        logger.error('AuthContext', 'Error refreshing auth state', { error: err });
        const errorMessage = err instanceof Error ? err.message : 'Authentication error';
        setError(errorMessage);
        logRequest(0, true);
        
        // Only show toast for non-circuit breaker errors
        if (!errorMessage.includes('Circuit breaker')) {
          toastService.error("Authentication error", {
            description: "There was a problem refreshing your session"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    try {
      const isDev = import.meta.env.MODE === 'development';
      if (isDev) {
        logger.debug('AuthContext', 'Dev mode detected - skipping circuit breaker for refresh');
        await runRefresh();
      } else {
        await authCircuitBreaker.execute(runRefresh);
      }
    } catch (err) {
      logger.warn('AuthContext', 'Circuit breaker prevented auth refresh', { error: err instanceof Error ? err.message : err });
      // Ensure loading unblocks even if breaker is OPEN
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfileWithOptimization, buildUserFromProfile, logRequest]);

  // Debounced version to prevent rapid-fire refreshes
  const debouncedRefreshAuthState = useCallback(
    debounce(refreshAuthState, 1000),
    [refreshAuthState]
  );

  const handleAuthStateChange = useCallback(async (event: string, newSession: Session | null) => {
    logger.debug('AuthContext', 'Auth state change event', { event });
    
    // Use debounced refresh for state changes to prevent spam
    if (event === 'SIGNED_OUT') {
      setUser(null);
      setSession(null);
      setIsLoading(false);
      return;
    }
    
    if (newSession) {
      setSession(newSession);
      
      if (newSession.user) {
        const profile = await fetchProfileWithOptimization(newSession.user.id);
        const newUser = buildUserFromProfile(newSession.user, profile);
        setUser(newUser);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [fetchProfileWithOptimization, buildUserFromProfile]);

  useEffect(() => {
    // Set up auth state listener with throttling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initialize auth state
    refreshAuthState();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-initialization

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user && !!session,
    refreshAuthState: debouncedRefreshAuthState,
    // Expose circuit breaker stats for debugging
    circuitBreakerStats: {
      profile: profileFetchCircuitBreaker.getStats(),
      auth: authCircuitBreaker.getStats()
    }
  };
};