
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

interface StockFormHeaderProps {
  showSourceLocation?: boolean;
  showDestinationLocation?: boolean;
  showLocation?: boolean;
}

const locations = [
  { label: "Main Storage", value: "main" },
  { label: "Villa Caldera", value: "villa_caldera" },
  { label: "Villa Oceana", value: "villa_oceana" },
  { label: "Villa Azure", value: "villa_azure" },
  { label: "Villa Sunset", value: "villa_sunset" },
  { label: "Villa Paradiso", value: "villa_paradiso" },
];

const StockFormHeader: React.FC<StockFormHeaderProps> = ({
  showSourceLocation = false,
  showDestinationLocation = false,
  showLocation = false,
}) => {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {showLocation && (
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showSourceLocation && (
        <FormField
          control={control}
          name="sourceLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showDestinationLocation && (
        <FormField
          control={control}
          name="destinationLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showSourceLocation || showLocation ? (
        <FormField
          control={control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., INV-2023-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {showSourceLocation
                ? "Transfer Date"
                : showLocation
                ? "Receipt Date"
                : "Date"}
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StockFormHeader;
