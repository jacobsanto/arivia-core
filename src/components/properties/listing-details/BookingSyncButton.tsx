import React from 'react';
import { Button } from '@/components/ui/button';
import { useBookingSync } from '@/hooks/useBookingSync';
import { Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface BookingSyncButtonProps {
  listingId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSyncComplete?: () => void;
  label?: string;
}
export const BookingSyncButton: React.FC<BookingSyncButtonProps> = ({
  listingId,
  variant = 'outline',
  size = 'default',
  className = '',
  onSyncComplete,
  label = 'Sync Bookings'
}) => {
  const {
    isSyncing,
    syncBookings,
    syncBookingsForListing,
    failedListings
  } = useBookingSync({
    onSyncComplete
  });
  const handleSync = () => {
    if (listingId) {
      syncBookingsForListing(listingId);
    } else {
      syncBookings();
    }
  };
  const hasPartialSuccess = failedListings.length > 0;
  return (
    <div className="relative inline-block">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Calendar className="mr-2 h-4 w-4" />
        )}
        {label}
      </Button>
      {hasPartialSuccess && !isSyncing && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs h-5 min-w-5 flex items-center justify-center">
          {failedListings.length}
        </Badge>
      )}
    </div>
  );
};