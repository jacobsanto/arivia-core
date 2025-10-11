import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { vendorService, VendorWithCategoryNames } from "@/services/vendor.service";
import { logger } from "@/services/logger";

interface OrderFormVendorProps {
  selectedVendorId: string | null;
  setSelectedVendorId: (vendorId: string) => void;
}

const OrderFormVendor: React.FC<OrderFormVendorProps> = ({ 
  selectedVendorId, 
  setSelectedVendorId 
}) => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<VendorWithCategoryNames[]>([]);
  const [loading, setLoading] = useState(true);

  // Load vendors from database
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const vendorData = await vendorService.getVendors();
        setVendors(vendorData);
      } catch (error) {
        logger.error('OrderFormVendor', 'Error loading vendors', { error });
      } finally {
        setLoading(false);
      }
    };
    
    loadVendors();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading vendors...</div>
      </div>
    );
  }

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="vendor">Select Vendor</Label>
        <Select value={selectedVendorId || ""} onValueChange={setSelectedVendorId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{vendor.name}</span>
                  {vendor.contact_person && (
                    <span className="text-xs text-muted-foreground">
                      Contact: {vendor.contact_person}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedVendor && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">{selectedVendor.name}</h4>
          {selectedVendor.contact_person && (
            <p className="text-sm text-muted-foreground mb-1">
              Contact: {selectedVendor.contact_person}
            </p>
          )}
          {selectedVendor.email && (
            <p className="text-sm text-muted-foreground mb-1">
              Email: {selectedVendor.email}
            </p>
          )}
          {selectedVendor.phone && (
            <p className="text-sm text-muted-foreground mb-1">
              Phone: {selectedVendor.phone}
            </p>
          )}
          {selectedVendor.category_names && selectedVendor.category_names.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedVendor.category_names.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFormVendor;