
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Sample vendor data - in a real app this would come from a database or context
const vendors = [
  { 
    id: "1", 
    name: "Office Supplies Co.",
    categories: ["Office Supplies", "Paper Products", "Kitchen Supplies", "Linens & Towels"]
  },
  { 
    id: "2", 
    name: "Cleaning Solutions Inc.",
    categories: ["Cleaning Supplies"] 
  },
  { 
    id: "3", 
    name: "Hospitality Essentials",
    categories: ["Guest Amenities", "Toiletries", "Bathroom Supplies", "Linens & Towels"]
  },
];

const OrderFormVendor: React.FC = () => {
  const { control } = useFormContext();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="vendorId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    <div>
                      {vendor.name}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vendor.categories.map((category, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="requestor"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Requested By</FormLabel>
            <FormControl>
              <Input placeholder="Your name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OrderFormVendor;
