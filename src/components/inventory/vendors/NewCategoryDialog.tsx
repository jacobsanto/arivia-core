
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: string) => void;
}

const NewCategoryDialog = ({ isOpen, onOpenChange, onAddCategory }: NewCategoryDialogProps) => {
  const [newCategory, setNewCategory] = useState("");

  const handleCreateNewCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for vendors
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="newCategory">Category Name</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateNewCategory}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCategoryDialog;
