
import React from "react";
import { BookingItem } from "./BookingItem";

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
  return (
    <div className="space-y-4">
      {bookingsWithTasks.map((item) => (
        <BookingItem
          key={item.booking.id}
          booking={item.booking}
          onTriggerCleaning={onTriggerCleaning}
          onMarkCleaned={onMarkCleaned}
          isCleaningTriggered={!!item.cleaningTask}
          cleaningTask={item.cleaningTask}
        />
      ))}
    </div>
  );
}
