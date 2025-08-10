
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, BarChart3 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useBookingSync } from '@/hooks/useBookingSync';
// removed Button
import { Progress } from '@/components/ui/progress';

const BookingSyncDashboard = () => {
  const { isSyncing } = useBookingSync();
  
  // Get the latest successful sync
  const { data: latestSync, refetch } = useQuery({
    queryKey: ['latest-booking-sync'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('sync_type', 'full_bookings_sync')
        .eq('status', 'completed')
        .order('end_time', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // refetch every minute
  });
  
  // Get booking sync statistics
  const { data: stats } = useQuery({
    queryKey: ['booking-sync-stats'],
    queryFn: async () => {
      const { data: bookings, error: bookingsError } = await supabase
        .from('guesty_bookings')
        .select('count')
        .single();
      
      if (bookingsError) throw bookingsError;
      
      const { data: logs, error: logsError } = await supabase
        .from('sync_logs')
        .select('bookings_created, bookings_updated, bookings_deleted')
        .eq('sync_type', 'full_bookings_sync')
        .order('end_time', { ascending: false })
        .limit(10);
        
      if (logsError) throw logsError;
      
      const totals = (logs || []).reduce((acc: any, log: any) => {
        acc.created += log.bookings_created || 0;
        acc.updated += log.bookings_updated || 0;
        acc.deleted += log.bookings_deleted || 0;
        return acc;
      }, { created: 0, updated: 0, deleted: 0 });
      
      return {
        totalBookings: bookings?.count || 0,
        ...totals
      };
    }
  });
  
  return (
    <Card className="mt-6">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Booking Synchronization
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Manual Guesty sync is disabled.
              </p>
            </div>
            
            {latestSync && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Last Successful Sync</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(latestSync.end_time), { addSuffix: true })}
                  <span className="block text-xs">
                    {format(new Date(latestSync.end_time), 'PPpp')}
                  </span>
                </p>
                <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                  <span>{latestSync.items_count || 0} bookings synced</span>
                  <span>•</span>
                  <span>{Math.round((latestSync.sync_duration || 0) / 1000)}s</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Booking Statistics</h4>
            
            {stats && (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-green-700 text-xl font-semibold">{stats.created}</p>
                    <p className="text-xs text-green-600">Created</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-700 text-xl font-semibold">{stats.updated}</p>
                    <p className="text-xs text-blue-600">Updated</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2">
                    <p className="text-amber-700 text-xl font-semibold">{stats.deleted}</p>
                    <p className="text-xs text-amber-600">Deleted</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{stats.totalBookings} total bookings</span>
                </div>
              </>
            )}
            
            {isSyncing && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span>Sync in progress</span>
                </div>
                <Progress
                  value={undefined}
                  className="h-2 animate-pulse"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSyncDashboard;
