
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { VendorStatus, Vendor } from "../orders/OrderUtils";

interface VendorFormProps {
  formData: Omit<Vendor, "id">;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Vendor, "id">>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleAddCategory: () => void;
  handleRemoveCategory: (category: string) => void;
  handleCategorySelect: (value: string) => void;
  selectedCategory: string;
  categories: string[];
  onOpenNewCategoryDialog: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const VendorForm = ({
  formData,
  setFormData,
  handleInputChange,
  handleAddCategory,
  handleRemoveCategory,
  handleCategorySelect,
  selectedCategory,
  categories,
  onOpenNewCategoryDialog,
  onSubmit,
  onCancel,
  isEditing
}: VendorFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Vendor Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="category">Categories</Label>
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <Select onValueChange={handleCategorySelect} value={selectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 ml-2">
                <Button 
                  type="button" 
                  onClick={handleAddCategory} 
                  disabled={!selectedCategory}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button 
                  type="button" 
                  onClick={onOpenNewCategoryDialog}
                  variant="outline"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {category}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {category}</span>
                  </button>
                </Badge>
              ))}
            </div>
            {formData.categories.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                At least one category is required
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as VendorStatus }))} 
              value={formData.status}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Update Vendor" : "Add Vendor"}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
