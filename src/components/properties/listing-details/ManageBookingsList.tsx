
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingTaskBadge } from "./BookingTaskBadge";

export interface BookingWithTask {
  booking: any;
  cleaningTask: any | null;
}
interface Props {
  bookingsWithTasks: BookingWithTask[];
  onTriggerCleaning: (bookingId: string) => void;
  onMarkCleaned: (taskId: string) => void;
}

export function ManageBookingsList({ bookingsWithTasks, onTriggerCleaning, onMarkCleaned }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Mobile-first card vertical stack
  return (
    <div className="flex flex-col gap-3">
      {bookingsWithTasks.map((item) => {
        const { booking, cleaningTask } = item;
        const isExpanded = !!expanded[booking.id];

        // Status badge color
        let statusColor: any = "secondary";
        if (booking.status?.toLowerCase() === "confirmed") statusColor = "default";
        else if (booking.status?.toLowerCase().includes("cancel")) statusColor = "destructive";
        else if (booking.status?.toLowerCase().includes("pending")) statusColor = "outline";

        return (
          <Card key={booking.id} className="overflow-visible">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-base">{booking.guest_name || "Guest"}</div>
                  <div className="flex items-center text-xs gap-1 text-muted-foreground mt-0.5">
                    <Calendar className="h-4 w-4" />
                    {booking.check_in && (
                      <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
                    )}
                    <span className="mx-1">–</span>
                    {booking.check_out && (
                      <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="text-[11px] mt-1 text-muted-foreground">
                    Booking ID: {booking.id}
                  </div>
                </div>
                <div>
                  <Badge variant={statusColor} className="mb-2 capitalize">
                    {booking.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent min-w-10 rounded-full"
                    aria-label="View booking details"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [booking.id]: !prev[booking.id],
                      }))
                    }
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Cleaning status or trigger button */}
              <div className="flex flex-wrap gap-2 items-center">
                {cleaningTask ? (
                  <>
                    <BookingTaskBadge status={cleaningTask.status} />
                    {cleaningTask.status !== "done" && (
                      <Button
                        size="sm"
                        className="text-xs min-h-[44px]"
                        onClick={() => onMarkCleaned(cleaningTask.id)}
                        variant="outline"
                      >
                        Mark as Cleaned
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs min-h-[44px]"
                    onClick={() => onTriggerCleaning(booking.id)}
                    variant="outline"
                  >
                    🧼 Trigger Cleaning
                  </Button>
                )}
              </div>

              {/* Expand/collapse for booking details */}
              {isExpanded && (
                <div className="mt-3 border-t pt-2 space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Guest Email:</span> {booking.raw_data?.guest?.email || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Guests Count:</span> {booking.raw_data?.guestsCount || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> €{booking.raw_data?.money?.netAmount || "N/A"}
                  </div>
                  {/* Add more details if desired */}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
