
import React from "react";
import { Property } from "@/types/property.types";
import BookingCalendar from "@/components/properties/bookings";

interface PropertyBookingsViewProps {
  property: Property;
  onBack: () => void;
}

const PropertyBookingsView: React.FC<PropertyBookingsViewProps> = ({ property, onBack }) => {
  return <BookingCalendar property={property} onBack={onBack} />;
};

export default PropertyBookingsView;
