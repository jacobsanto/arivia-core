
import React, { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useFormArray } from "@/hooks/useFormArray";
import { getItemsByVendor } from "@/data/inventoryData";

interface OrderItemListProps {
  title: string;
  selectedVendorId: string | null;
}

const OrderItemList: React.FC<OrderItemListProps> = ({ title, selectedVendorId }) => {
  const methods = useFormContext();
  const formHook = useFormArray();
  const { fields, append, remove } = formHook.getFieldArray("items");
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  
  // Update available items when vendor changes
  useEffect(() => {
    const items = getItemsByVendor(selectedVendorId);
    setAvailableItems(items);
  }, [selectedVendorId]);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      
      {!selectedVendorId && (
        <div className="text-sm text-amber-500 mb-4">
          Please select a vendor first to see available items
        </div>
      )}
      
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
          <div className="md:col-span-8">
            <FormField
              control={methods.control}
              name={`items.${index}.itemId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                    Item
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedVendorId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} <span className="text-xs text-muted-foreground">({item.category})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={methods.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                    Quantity
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <MinusCircle className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ itemId: "", quantity: 1 })}
        disabled={!selectedVendorId}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Another Item
      </Button>
    </div>
  );
};

export default OrderItemList;
