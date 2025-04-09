
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";

interface MobileAddItemProps {
  onComplete: () => void;
}

const MobileAddItem = ({ onComplete }: MobileAddItemProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" placeholder="Enter item name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bathroom">Bathroom</SelectItem>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="bedroom">Bedroom</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Enter item description" className="resize-none" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU/Code</Label>
          <Input id="sku" placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select>
            <SelectTrigger id="unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="each">Each</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="pack">Pack</SelectItem>
              <SelectItem value="kg">Kilogram</SelectItem>
              <SelectItem value="l">Liter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="minStock">Min Stock Level</Label>
          <Input id="minStock" type="number" min="0" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialStock">Initial Stock</Label>
          <Input id="initialStock" type="number" min="0" placeholder="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Initial Location</Label>
        <Select>
          <SelectTrigger id="location">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Main Storage</SelectItem>
            <SelectItem value="villa1">Villa Caldera</SelectItem>
            <SelectItem value="villa2">Villa Azure</SelectItem>
            <SelectItem value="villa3">Villa Sunset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Item Photo</Label>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full" type="button">
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
          <Button variant="outline" className="w-full" type="button">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="pt-4 flex gap-2 sticky bottom-0 bg-background pb-2">
        <Button variant="outline" className="flex-1" onClick={onComplete}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onComplete}>
          Add Item
        </Button>
      </div>
    </div>
  );
};

export default MobileAddItem;
