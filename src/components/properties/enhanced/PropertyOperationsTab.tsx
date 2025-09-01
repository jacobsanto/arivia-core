import React from "react";
import { PropertyOperationsTabEnhanced } from "./PropertyOperationsTabEnhanced";

interface PropertyOperationsTabProps {
  propertyId: string;
}

export const PropertyOperationsTab: React.FC<PropertyOperationsTabProps> = ({ propertyId }) => {
  return <PropertyOperationsTabEnhanced propertyId={propertyId} />;
};