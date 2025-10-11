// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/services/logger';

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  details: Record<string, any>;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface SecurityDashboard {
  recent_security_events: SecurityEvent[];
  unresolved_events_count: number;
  critical_events_count: number;
  active_users_count: number;
  failed_login_attempts: number;
}

export interface SystemHealth {
  database: {
    tables_count: number;
    active_connections: number;
    rls_enabled_tables: number;
  };
  authentication: {
    total_users: number;
    active_sessions: number;
  };
  integrations: {
    guesty_listings: number;
    guesty_bookings: number;
    last_sync: string;
  };
  performance: {
    avg_query_time: number;
    slow_queries_count: number;
  };
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useSecurityMonitoring = () => {
  const [securityDashboard, setSecurityDashboard] = useState<SecurityDashboard | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityDashboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_security_dashboard');
      if (error) throw error;
      setSecurityDashboard(data as unknown as SecurityDashboard);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch security dashboard';
      setError(errorMessage);
      if (err.message?.includes('Access denied')) {
        console.warn('Security dashboard access denied - requires superadmin role');
      } else {
        toast.error(errorMessage);
      }
    }
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_health');
      if (error) throw error;
      setSystemHealth(data as unknown as SystemHealth);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch system health';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const fetchUserActivity = useCallback(async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      setActivities((data || []).map(item => ({
        ...item,
        details: item.details as Record<string, any>,
        ip_address: item.ip_address as string
      })));
    } catch (err: any) {
      logger.error('Error fetching user activity', err);
      // Don't show toast for activity logs as they're not critical
    }
  }, []);

  const logSecurityEvent = useCallback(async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase.rpc('log_security_event', {
        event_type: eventType,
        severity,
        details
      });
      
      if (error) throw error;
      
      // Refresh security dashboard after logging event
      await fetchSecurityDashboard();
      
      return data;
    } catch (err: any) {
      logger.error('Error logging security event', err);
      toast.error('Failed to log security event');
      throw err;
    }
  }, [fetchSecurityDashboard]);

  const resolveSecurityEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast.success('Security event resolved');
      await fetchSecurityDashboard();
    } catch (err: any) {
      logger.error('Error resolving security event', err);
      toast.error('Failed to resolve security event');
    }
  }, [fetchSecurityDashboard]);

  const logUserActivity = useCallback(async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details
        });
      
      if (error) throw error;
      
      // Optionally refresh activity log
      // await fetchUserActivity();
      
      return data;
    } catch (err: any) {
      logger.error('Error logging user activity', err);
      // Don't throw error for activity logging failures
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchSecurityDashboard(),
      fetchSystemHealth(),
      fetchUserActivity()
    ]);
    setLoading(false);
  }, [fetchSecurityDashboard, fetchSystemHealth, fetchUserActivity]);

  const getHealthScore = useCallback(() => {
    if (!systemHealth || !securityDashboard) return 0;
    
    let score = 100;
    
    // Performance penalties
    if (systemHealth.performance.avg_query_time > 100) score -= 10;
    if (systemHealth.performance.slow_queries_count > 5) score -= 15;
    
    // Security penalties
    if (securityDashboard.unresolved_events_count > 0) score -= 20;
    if (securityDashboard.critical_events_count > 0) score -= 30;
    if (securityDashboard.failed_login_attempts > 10) score -= 15;
    
    // RLS coverage bonus
    const rlsCoverage = systemHealth.database.rls_enabled_tables / systemHealth.database.tables_count;
    if (rlsCoverage < 0.8) score -= 25;
    
    return Math.max(0, Math.min(100, score));
  }, [systemHealth, securityDashboard]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Set up real-time subscriptions for security events
  useEffect(() => {
    const securityEventsChannel = supabase
      .channel('security-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_events'
        },
        () => {
          fetchSecurityDashboard();
        }
      )
      .subscribe();

    const activityChannel = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity_log'
        },
        () => {
          fetchUserActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(securityEventsChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [fetchSecurityDashboard, fetchUserActivity]);

  return {
    securityDashboard,
    systemHealth,
    activities,
    loading,
    error,
    healthScore: getHealthScore(),
    refreshAll,
    logSecurityEvent,
    resolveSecurityEvent,
    logUserActivity,
    fetchSecurityDashboard,
    fetchSystemHealth,
    fetchUserActivity
  };
};