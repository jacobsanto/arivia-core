
import React from "react";
import { Property } from "@/types/property.types";
import PropertyDetails from "@/components/properties/PropertyDetails";

interface PropertyDetailsViewProps {
  property: Property;
  onBack: () => void;
}

const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ property, onBack }) => {
  return <PropertyDetails property={property} onBack={onBack} />;
};

export default PropertyDetailsView;
