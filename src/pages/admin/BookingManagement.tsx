import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, FileText, PlusCircle, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  status: string;
  property_name: string;
  internal_notes: string;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  // Mock data for demonstration
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: "1",
        guest_name: "John Smith",
        guest_email: "john.smith@email.com",
        guest_phone: "+1234567890",
        check_in_date: "2024-01-15",
        check_out_date: "2024-01-20",
        num_guests: 2,
        total_price: 1250.00,
        status: "confirmed",
        property_name: "Villa Sunset",
        internal_notes: "Repeat guest, VIP treatment"
      },
      {
        id: "2",
        guest_name: "Alice Johnson",
        guest_email: "alice.johnson@email.com",
        guest_phone: "+9876543210",
        check_in_date: "2024-02-01",
        check_out_date: "2024-02-05",
        num_guests: 4,
        total_price: 2400.00,
        status: "pending",
        property_name: "Ocean View Suite",
        internal_notes: "Request for extra towels"
      },
      {
        id: "3",
        guest_name: "Bob Williams",
        guest_email: "bob.williams@email.com",
        guest_phone: "+1122334455",
        check_in_date: "2024-03-10",
        check_out_date: "2024-03-15",
        num_guests: 1,
        total_price: 800.00,
        status: "cancelled",
        property_name: "Mountain Cabin",
        internal_notes: "Cancelled due to flight delay"
      },
      {
        id: "4",
        guest_name: "Emily Davis",
        guest_email: "emily.davis@email.com",
        guest_phone: "+9988776655",
        check_in_date: "2024-04-22",
        check_out_date: "2024-04-28",
        num_guests: 2,
        total_price: 1800.00,
        status: "confirmed",
        property_name: "Luxury Apartment",
        internal_notes: "Requested airport pickup"
      },
      {
        id: "5",
        guest_name: "David Brown",
        guest_email: "david.brown@email.com",
        guest_phone: "+5544332211",
        check_in_date: "2024-05-05",
        check_out_date: "2024-05-10",
        num_guests: 3,
        total_price: 2100.00,
        status: "confirmed",
        property_name: "Seaside Villa",
        internal_notes: "Family vacation"
      }
    ];
    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
  }, []);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBookings(prev => prev.map(booking => ({
        ...booking,
        internal_notes: booking.internal_notes || "Auto-synced from Guesty"
      })));
      
      toast.success("Bookings synced successfully");
    } catch (error) {
      toast.error("Failed to sync bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  useEffect(() => {
    let results = bookings;

    if (searchTerm) {
      results = results.filter(booking =>
        booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.property_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      results = results.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(results);
  }, [searchTerm, statusFilter, bookings]);

  return (
    <div>
      <Helmet>
        <title>Booking Management - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl">
                <Calendar className="mr-2 h-7 w-7" /> Booking Management
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight">
                Manage and view all property bookings
              </p>
            </div>
          </div>
          <Button onClick={handleSync} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Bookings
              </>
            )}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Filter bookings by guest name, email, property, or status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <select
                className="border rounded-md px-4 py-2"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6">
          {filteredBookings.map(booking => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{booking.guest_name}</CardTitle>
                  <Badge variant="secondary">{booking.status}</Badge>
                </div>
                <CardDescription>{booking.property_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <Eye className="mr-2 inline-block h-4 w-4" />
                  {booking.guest_email}
                </p>
                <p>
                  <Calendar className="mr-2 inline-block h-4 w-4" />
                  {booking.check_in_date} - {booking.check_out_date}
                </p>
                <p>
                  <Users className="mr-2 inline-block h-4 w-4" />
                  {booking.num_guests} Guests
                </p>
                {booking.internal_notes && (
                  <p>
                    <FileText className="mr-2 inline-block h-4 w-4" />
                    {booking.internal_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredBookings.length === 0 && (
            <Card>
              <CardContent className="text-center">
                No bookings found.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
