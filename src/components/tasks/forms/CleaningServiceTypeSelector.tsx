
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CleaningServiceTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const cleaningServiceTypes = [
  {
    value: "Standard Cleaning",
    label: "Standard Cleaning",
    description: "Complete deep cleaning for check-in/check-out preparation"
  },
  {
    value: "Full Cleaning",
    label: "Full Cleaning", 
    description: "Regular maintenance cleaning during guest stays"
  },
  {
    value: "Linen & Towel Change",
    label: "Linen & Towel Change",
    description: "Fresh linens and towels replacement service"
  }
];

const CleaningServiceTypeSelector: React.FC<CleaningServiceTypeSelectorProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  return (
    <FormItem>
      <FormLabel>Cleaning Service Type</FormLabel>
      <Select onValueChange={onValueChange} value={value} disabled={disabled}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select cleaning service type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {cleaningServiceTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex flex-col">
                <span className="font-medium">{type.label}</span>
                <span className="text-xs text-muted-foreground">{type.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default CleaningServiceTypeSelector;
