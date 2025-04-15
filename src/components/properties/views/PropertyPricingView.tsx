
import React from "react";
import { Property } from "@/types/property.types";
import PricingConfig from "@/components/properties/PricingConfig";

interface PropertyPricingViewProps {
  property: Property;
  onBack: () => void;
}

const PropertyPricingView: React.FC<PropertyPricingViewProps> = ({ property, onBack }) => {
  return <PricingConfig property={property} onBack={onBack} />;
};

export default PropertyPricingView;
