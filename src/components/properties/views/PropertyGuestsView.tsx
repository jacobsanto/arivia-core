
import React from "react";
import { Property } from "@/types/property.types";
import GuestManagement from "@/components/properties/GuestManagement";

interface PropertyGuestsViewProps {
  property: Property;
  onBack: () => void;
}

const PropertyGuestsView: React.FC<PropertyGuestsViewProps> = ({ property, onBack }) => {
  return <GuestManagement property={property} onBack={onBack} />;
};

export default PropertyGuestsView;
