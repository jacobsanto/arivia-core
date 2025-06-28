import React, { useState, useMemo } from "react";
import { BookingObject } from "@/utils/booking/housekeepingTaskGenerator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import BookingCleaningTasksIndicator from "./BookingCleaningTasksIndicator";
import GenerateCleaningTasksButton from "./GenerateCleaningTasksButton";

// Define the HousekeepingTask type locally since it's used here
interface HousekeepingTask {
  id: string;
  booking_id: string;
  listing_id: string;
  task_type: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

interface BookingsListWrapperProps {
  listingId: string;
  bookings: BookingObject[];
  housekeepingTasks: HousekeepingTask[];
  onRefresh: () => void;
}

const BookingsListWrapper: React.FC<BookingsListWrapperProps> = ({
  listingId,
  bookings,
  housekeepingTasks,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<string>("check_in");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if already sorting by this field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending order
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        booking.guest_name.toLowerCase().includes(searchTerm) ||
        booking.id.toLowerCase().includes(searchTerm)
      );
    });
  }, [bookings, searchQuery]);

  const sortedBookings = useMemo(() => {
    const sorted = [...filteredBookings].sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredBookings, sortBy, sortOrder]);

  const filteredAndSortedBookings = sortedBookings;

  return (
    <div className="space-y-4">
      {/* Header with Generate Tasks Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Bookings</h3>
        <GenerateCleaningTasksButton 
          listingId={listingId}
          onTasksGenerated={onRefresh}
        />
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          type="search"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-md"
        />

        <div className="flex items-center space-x-2">
          <Label htmlFor="sort">Sort by:</Label>
          <Select onValueChange={handleSortChange} defaultValue={sortBy}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check_in">Check-in Date</SelectItem>
              <SelectItem value="check_out">Check-out Date</SelectItem>
              <SelectItem value="guest_name">Guest Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredAndSortedBookings.map((booking) => {
          const bookingTasks = housekeepingTasks.filter(task => task.booking_id === booking.id);
          const stayDuration = Math.ceil(
            (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 
            (1000 * 60 * 60 * 24)
          );

          return (
            <div key={booking.id} className="border rounded-lg p-4 space-y-3">
              {/* Booking Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold">{booking.guest_name}</h4>
                <span className="text-sm text-muted-foreground">Booking ID: {booking.id}</span>
              </div>
              
              {/* Add Cleaning Tasks Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cleaning Tasks:</span>
                  <BookingCleaningTasksIndicator
                    hasCleaningTasks={bookingTasks.length > 0}
                    tasksCount={bookingTasks.length}
                    stayDuration={stayDuration}
                  />
                </div>
                
                {/* Booking Status and Dates */}
                <div className="text-right">
                  <span className="text-sm font-medium">{booking.status}</span>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(booking.check_in), "MMM dd, yyyy")} -{" "}
                    {format(new Date(booking.check_out), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-1">
                <p className="text-sm">
                  Check-in: {format(new Date(booking.check_in), "MMM dd, yyyy")}
                </p>
                <p className="text-sm">
                  Check-out: {format(new Date(booking.check_out), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedBookings.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No bookings found.</p>
        </div>
      )}

      {/* Pagination (if needed) */}
    </div>
  );
};

export default BookingsListWrapper;
