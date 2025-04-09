
import { useState } from 'react';
import { useGuesty } from '@/contexts/GuestyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ArrowDown, ArrowUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toastService } from '@/services/toast/toast.service';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';

export default function BookingSync() {
  const { reservations } = useGuesty();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterDate, setFilterDate] = useState(new Date());

  const syncAllBookings = async () => {
    try {
      setSyncInProgress(true);
      // Force a refetch of bookings
      await reservations.refetch();
      
      toastService.success('Bookings synchronized', {
        description: `${reservations.reservations.length} bookings have been synced from Guesty`
      });
    } catch (error) {
      toastService.error('Sync failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setFilterDate(date);
    // Apply booking filter based on check-in date
    reservations.filterByDateRange(date);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'checked-in':
        return 'default'; // Changed from 'success' to 'default' with custom styling
      case 'checked-out':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      case 'pending':
        return 'outline'; // Changed from 'warning' to 'outline'
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return '';
    }
  };

  const today = new Date();
  const filteredReservations = reservations.reservations.filter(reservation => {
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);
    
    if (activeTab === 'upcoming') {
      return checkInDate > today;
    }
    if (activeTab === 'current') {
      return checkInDate <= today && checkOutDate >= today;
    }
    if (activeTab === 'past') {
      return checkOutDate < today;
    }
    return true; // 'all' tab
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>Guesty Booking Sync</span>
          <Button 
            onClick={syncAllBookings} 
            disabled={syncInProgress || reservations.isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardTitle>
        <CardDescription>
          Synchronize bookings between Guesty and Arivia Villas
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <DateRangeFilter 
            date={filterDate} 
            onDateChange={handleDateChange} 
          />
          <p className="text-xs text-muted-foreground mt-2">
            Showing bookings with check-in from {format(filterDate, 'PP')} onwards
          </p>
        </div>

        <Tabs 
          defaultValue="upcoming" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {reservations.isLoading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : filteredReservations.length > 0 ? (
                filteredReservations.map(reservation => (
                  <div key={reservation._id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </div>
                      <Badge 
                        variant={getStatusVariant(reservation.status)}
                        className={getStatusColor(reservation.status)}
                      >
                        {reservation.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Check-in: {format(new Date(reservation.checkIn), 'PP')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Check-out: {format(new Date(reservation.checkOut), 'PP')}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{reservation.guestsCount} guests • {reservation.nightsCount} nights</span>
                      <span className="font-semibold">
                        {reservation.money.totalPrice} {reservation.money.currency}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredReservations.length} bookings
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reservations.prevPage}
            disabled={reservations.queryParams.skip === 0}
            className="flex items-center gap-1"
          >
            <ArrowUp className="h-4 w-4" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reservations.nextPage}
            disabled={filteredReservations.length < (reservations.queryParams.limit || 20)}
            className="flex items-center gap-1"
          >
            Next <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
