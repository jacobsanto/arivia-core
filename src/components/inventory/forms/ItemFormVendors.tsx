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
import { vendorService, VendorWithCategoryNames } from "@/services/vendor.service";
import { useInventory } from "@/contexts/InventoryContext";
import { logger } from "@/services/logger";

interface ItemFormVendorsProps {
  selectedCategory: string;
}

const ItemFormVendors: React.FC<ItemFormVendorsProps> = ({ selectedCategory }) => {
  const { control, setValue, watch } = useFormContext();
  const { categoryObjects } = useInventory();
  const selectedVendors = watch("vendorIds") || [];
  
  const [vendors, setVendors] = useState<VendorWithCategoryNames[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorWithCategoryNames[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load vendors from database
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const vendorData = await vendorService.getVendors();
        setVendors(vendorData);
      } catch (error) {
        logger.error('ItemFormVendors', 'Error loading vendors', { error });
      } finally {
        setLoading(false);
      }
    };
    
    loadVendors();
  }, []);
  
  // Filter vendors by selected category
  useEffect(() => {
    if (selectedCategory && vendors.length > 0) {
      const selectedCategoryObj = categoryObjects.find(cat => cat.name === selectedCategory);
      if (selectedCategoryObj) {
        const filtered = vendors.filter(vendor => 
          vendor.categories.includes(selectedCategoryObj.id)
        );
        setFilteredVendors(filtered);
        
        // Remove any selected vendors that don't support this category
        const filteredIds = filtered.map(v => v.id);
        const validSelectedVendors = selectedVendors.filter(id => filteredIds.includes(id));
        if (validSelectedVendors.length !== selectedVendors.length) {
          setValue("vendorIds", validSelectedVendors);
        }
      } else {
        setFilteredVendors([]);
      }
    } else {
      setFilteredVendors(vendors);
    }
  }, [selectedCategory, vendors, categoryObjects, selectedVendors, setValue]);
  
  const handleVendorToggle = (vendorId: string, checked: boolean) => {
    const updatedVendors = checked
      ? [...selectedVendors, vendorId]
      : selectedVendors.filter(id => id !== vendorId);
    
    setValue("vendorIds", updatedVendors, { shouldValidate: true });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div>
      <FormField
        control={control}
        name="vendorIds"
        render={() => (
          <FormItem>
            <FormLabel>Vendors (Optional)</FormLabel>
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
                    {selectedCategory 
                      ? "No vendors available for this category. You can still create the item without vendors."
                      : "No vendors available. You can still create the item without vendors."
                    }
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
                        {vendor.contact_person && (
                          <span className="text-xs text-muted-foreground ml-2">
                            Contact: {vendor.contact_person}
                          </span>
                        )}
                        {vendor.category_names && vendor.category_names.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({vendor.category_names.join(", ")})
                          </span>
                        )}
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