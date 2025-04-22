
import React from "react";
import { BookingsListSection } from "./BookingsListSection";

interface BookingsListWrapperProps {
  type: "upcoming" | "past";
  bookings: any[];
  maxToShow: number;
  onTriggerCleaning: (bookingId: string) => void;
  onMarkCleaned: (bookingId: string) => void;
  triggeredCleanings: string[];
}
const BookingsListWrapper: React.FC<BookingsListWrapperProps> = ({
  type,
  bookings,
  maxToShow,
  onTriggerCleaning,
  onMarkCleaned,
  triggeredCleanings,
}) => {
  const isUpcoming = type === "upcoming";
  return (
    <BookingsListSection
      title={isUpcoming ? "Upcoming Bookings" : "Past Bookings"}
      bookings={bookings}
      maxToShow={maxToShow}
      showViewAll={bookings.length > maxToShow}
      viewAllLabel={`View All ${bookings.length} ${isUpcoming ? "Upcoming" : "Past"} Bookings`}
      onTriggerCleaning={onTriggerCleaning}
      onMarkCleaned={onMarkCleaned}
      triggeredCleanings={triggeredCleanings}
    />
  );
};
export default BookingsListWrapper;
