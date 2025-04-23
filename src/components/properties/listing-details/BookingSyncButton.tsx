
import React from 'react';
import { Button } from '@/components/ui/button';
import { useBookingSync } from '@/hooks/useBookingSync';
import { Calendar, Loader2 } from 'lucide-react';

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
  const { isSyncing, syncBookings, syncBookingsForListing } = useBookingSync({
    onSyncComplete
  });
  
  const handleSync = () => {
    if (listingId) {
      syncBookingsForListing(listingId);
    } else {
      syncBookings();
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
};
