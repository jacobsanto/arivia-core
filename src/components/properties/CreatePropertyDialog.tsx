import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { Building2, MapPin, Bed, Bath } from "lucide-react";

interface CreatePropertyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePropertyDialog: React.FC<CreatePropertyDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    property_type: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    notes: "",
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('properties')
        .insert({
          name: formData.name,
          address: formData.address,
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          status: formData.status,
        } as any); // Type assertion until types regenerate

      if (error) throw error;

      toastService.success('Property created successfully!');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        property_type: "",
        bedrooms: "",
        bathrooms: "",
        description: "",
        notes: "",
        status: "active",
      });
    } catch (error) {
      console.error('Error creating property:', error);
      toastService.error('Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Property
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Villa Aurora"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Oia, Santorini, Greece"
                required
              />
            </div>

            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => handleInputChange('property_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bedrooms" className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms" className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Beautiful villa with stunning sea views..."
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Internal notes for staff..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};