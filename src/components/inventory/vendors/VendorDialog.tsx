
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VendorForm from "./VendorForm";
import { Vendor } from "../orders/OrderUtils";

interface VendorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
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
  isEditing: boolean;
}

const VendorDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
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
  isEditing,
}: VendorDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <VendorForm
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          handleAddCategory={handleAddCategory}
          handleRemoveCategory={handleRemoveCategory}
          handleCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          categories={categories}
          onOpenNewCategoryDialog={onOpenNewCategoryDialog}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
