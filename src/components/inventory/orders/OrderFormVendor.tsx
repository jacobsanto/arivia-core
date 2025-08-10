
import React, { useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";

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
  const { control, setValue } = useFormContext();
  const { user } = useUser();
  
  // Auto-populate requestor field with user's name
  useEffect(() => {
    if (user?.name) {
      setValue("requestor", user.name);
    }
  }, [user, setValue]);
  
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
              <Input placeholder="Your name" {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OrderFormVendor;
