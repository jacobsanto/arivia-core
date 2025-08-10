
import React, { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ItemFormVendorsProps {
  selectedCategory: string;
}

interface Vendor {
  id: string;
  name: string;
  categories: string[];
}

// Sample vendors data - in a real app, we'd get this from API/context
const vendors: Vendor[] = [
  {
    id: "1",
    name: "Office Supplies Co.",
    categories: ["Office Supplies", "Paper Products", "Kitchen Supplies", "Linens & Towels"],
  },
  {
    id: "2",
    name: "Cleaning Solutions Inc.",
    categories: ["Cleaning Supplies"],
  },
  {
    id: "3",
    name: "Hospitality Essentials",
    categories: ["Guest Amenities", "Toiletries", "Bathroom Supplies", "Linens & Towels"],
  },
];

const ItemFormVendors: React.FC<ItemFormVendorsProps> = ({ selectedCategory }) => {
  const { control, setValue, watch } = useFormContext();
  const selectedVendors = watch("vendorIds") || [];
  
  // Filter vendors by category
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>(vendors);
  
  useEffect(() => {
    if (selectedCategory) {
      const filtered = vendors.filter(vendor => 
        vendor.categories.includes(selectedCategory)
      );
      setFilteredVendors(filtered);
      
      // Remove any selected vendors that don't support this category
      const filteredIds = filtered.map(v => v.id);
      const validSelectedVendors = selectedVendors.filter(id => filteredIds.includes(id));
      if (validSelectedVendors.length !== selectedVendors.length) {
        setValue("vendorIds", validSelectedVendors);
      }
    } else {
      setFilteredVendors(vendors);
    }
  }, [selectedCategory, selectedVendors, setValue]);
  
  const handleVendorToggle = (vendorId: string, checked: boolean) => {
    const updatedVendors = checked
      ? [...selectedVendors, vendorId]
      : selectedVendors.filter(id => id !== vendorId);
    
    setValue("vendorIds", updatedVendors, { shouldValidate: true });
  };

  return (
    <div>
      <FormField
        control={control}
        name="vendorIds"
        render={() => (
          <FormItem>
            <FormLabel>Vendors</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {selectedCategory && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Showing vendors that supply {' '}
                    <Badge variant="outline">{selectedCategory}</Badge>
                  </div>
                )}
                {filteredVendors.length === 0 ? (
                  <div className="text-sm text-amber-500">
                    No vendors available for this category. Please select a different category or add a new vendor.
                  </div>
                ) : (
                  filteredVendors.map(vendor => (
                    <div key={vendor.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`vendor-${vendor.id}`}
                        checked={selectedVendors.includes(vendor.id)}
                        onCheckedChange={(checked) => handleVendorToggle(vendor.id, checked === true)}
                      />
                      <label
                        htmlFor={`vendor-${vendor.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {vendor.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({vendor.categories.join(", ")})
                        </span>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ItemFormVendors;
