import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  PropertyAmenity, 
  ALL_AMENITIES, 
  AMENITY_CATEGORIES 
} from "@/types/property-detailed.types";
import { usePropertyAmenities } from "@/hooks/useDetailedProperties";
import { 
  Save,
  X,
  Search,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface AmenitiesEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  currentAmenities: PropertyAmenity[];
}

export const AmenitiesEditModal: React.FC<AmenitiesEditModalProps> = ({
  isOpen,
  onOpenChange,
  propertyId,
  currentAmenities
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>(
    currentAmenities.map(a => a.id)
  );
  const { updateAmenities, isUpdating } = usePropertyAmenities(propertyId);

  // Filter amenities based on search query
  const filteredAmenities = useMemo(() => {
    if (!searchQuery) return ALL_AMENITIES;
    
    return ALL_AMENITIES.filter(amenity =>
      amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amenity.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group filtered amenities by category
  const amenitiesByCategory = useMemo(() => {
    return AMENITY_CATEGORIES.map(category => ({
      ...category,
      amenities: filteredAmenities.filter(amenity => amenity.category === category.id)
    })).filter(category => category.amenities.length > 0);
  }, [filteredAmenities]);

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenityIds(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSave = () => {
    updateAmenities(selectedAmenityIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedAmenityIds(currentAmenities.map(a => a.id));
    setSearchQuery("");
    onOpenChange(false);
  };

  const selectedCount = selectedAmenityIds.length;
  const hasChanges = JSON.stringify(selectedAmenityIds.sort()) !== 
                    JSON.stringify(currentAmenities.map(a => a.id).sort());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Property Amenities</DialogTitle>
          <DialogDescription>
            Select all amenities available at this property. Guests will see these when viewing the property details.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Counter */}
        <div className="flex items-center gap-4 py-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
        </div>

        {/* Amenities List */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {amenitiesByCategory.map((category) => (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">
                  {category.name}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {category.amenities.filter(a => selectedAmenityIds.includes(a.id)).length} / {category.amenities.length}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.amenities.map((amenity) => {
                  const isSelected = selectedAmenityIds.includes(amenity.id);
                  
                  return (
                    <div
                      key={amenity.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-primary/5 border-primary/30 hover:bg-primary/10' 
                          : 'bg-card hover:bg-muted/50 border-border'
                        }
                      `}
                      onClick={() => handleAmenityToggle(amenity.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium cursor-pointer">
                            {amenity.name}
                          </Label>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {amenitiesByCategory.length === 0 && (
            <div className="text-center py-8">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No amenities found
              </div>
              <div className="text-sm text-muted-foreground">
                Try adjusting your search term to find amenities.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedCount} amenities selected
              {hasChanges && <span className="text-primary ml-2">• Changes pending</span>}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isUpdating}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};