
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

const ItemFormDetails: React.FC = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Hand Towels" {...field} />
            </FormControl>
            <FormDescription>
              Enter the full name of the inventory item.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                  <SelectItem value="linen">Linens & Towels</SelectItem>
                  <SelectItem value="bathroom">Bathroom Supplies</SelectItem>
                  <SelectItem value="kitchen">Kitchen Supplies</SelectItem>
                  <SelectItem value="maintenance">Maintenance Supplies</SelectItem>
                  <SelectItem value="amenities">Guest Amenities</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="set">Set</SelectItem>
                  <SelectItem value="roll">Roll</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="case">Case</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="minLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Stock Level</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Alert will be raised when stock falls below this level
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="initialStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Stock Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Leave at 0 if adding item without stock
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ItemFormDetails;
