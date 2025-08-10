import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface CachedProfile {
  data: any;
  timestamp: number;
  error?: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, CachedProfile>();

export const useOptimizedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProfileWithCache = useCallback(async (userId: string) => {
    // Check cache first
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (cached.error) {
        console.warn('Using cached profile error:', cached.error);
        return null;
      }
      setProfile(cached.data);
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        // Cache the error to prevent repeated failed requests
        profileCache.set(userId, {
          data: null,
          timestamp: Date.now(),
          error: error.message
        });
        
        // Exponential backoff on retries
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => {
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            fetchProfileWithCache(userId);
          }
        }, backoffDelay);
        
        return null;
      }

      // Cache successful response
      profileCache.set(userId, {
        data,
        timestamp: Date.now()
      });
      
      setProfile(data);
      setRetryCount(0); // Reset retry count on success
      return data;
    } catch (error) {
      console.error('Network error fetching profile:', error);
      return null;
    }
  }, [retryCount]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfileWithCache(session.user.id);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile if we don't have it cached
          const cached = profileCache.get(session.user.id);
          if (!cached || Date.now() - cached.timestamp >= CACHE_DURATION) {
            await fetchProfileWithCache(session.user.id);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileWithCache]);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session,
  };
};