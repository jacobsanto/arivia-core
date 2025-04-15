
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PropertyHeaderProps {
  onAddProperty: () => void;
}

const PropertyHeader = ({ onAddProperty }: PropertyHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">
          Manage your portfolio of luxury villas.
        </p>
      </div>
      <Button onClick={onAddProperty}>
        <Plus className="mr-2 h-4 w-4" />
        Add Property
      </Button>
    </div>
  );
};

export default PropertyHeader;
