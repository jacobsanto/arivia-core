import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { VendorStatus, Vendor } from "../orders/OrderUtils";
import { useInventory } from "@/contexts/InventoryContext";

const initialVendors: Vendor[] = [];

export const useVendorManagement = () => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const { categories, addCategory } = useInventory();
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Omit<Vendor, "id">>({
    name: "",
    email: "",
    phone: "",
    categories: [],
    address: "",
    notes: "",
    status: "active",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "status") {
        return { ...prev, [name]: value as VendorStatus };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
  };

  const handleAddCategory = () => {
    if (selectedCategory && !formData.categories.includes(selectedCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, selectedCategory]
      }));
      setSelectedCategory("");
    } else if (selectedCategory) {
      toast({
        title: "Category already exists",
        description: "This category has already been added."
      });
    }
  };

  const handleCreateNewCategory = (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      // Add to global categories
      addCategory(categoryName);
      
      // Add to current vendor if not already there
      if (!formData.categories.includes(categoryName)) {
        setFormData(prev => ({
          ...prev,
          categories: [...prev.categories, categoryName]
        }));
      }
      
      toast({
        title: "Category Added",
        description: `"${categoryName}" has been added to categories.`
      });
    } else {
      toast({
        title: "Category already exists",
        description: "This category already exists in the system."
      });
    }
    
    setIsNewCategoryDialogOpen(false);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }));
  };

  const handleAddVendor = () => {
    setCurrentVendor(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      categories: [],
      address: "",
      notes: "",
      status: "active",
    });
    setSelectedCategory("");
    setIsVendorDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      categories: vendor.categories,
      address: vendor.address,
      notes: vendor.notes,
      status: vendor.status,
    });
    setSelectedCategory("");
    setIsVendorDialogOpen(true);
  };

  const handleDeleteVendor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      setVendors(vendors.filter((vendor) => vendor.id !== id));
      toast({
        title: "Vendor Deleted",
        description: "The vendor has been removed from your list.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.categories.length === 0) {
      toast({
        title: "Error",
        description: "At least one category is required.",
        variant: "destructive",
      });
      return;
    }

    if (currentVendor) {
      // Editing existing vendor
      setVendors(
        vendors.map((vendor) =>
          vendor.id === currentVendor.id ? { ...vendor, ...formData } : vendor
        )
      );
      toast({
        title: "Vendor Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Adding new vendor
      const newVendor = {
        ...formData,
        id: Date.now().toString(),
      };
      setVendors([...vendors, newVendor]);
      toast({
        title: "Vendor Added",
        description: `${formData.name} has been added to your vendors list.`,
      });
    }
    
    setIsVendorDialogOpen(false);
  };

  return {
    vendors,
    categories,
    isVendorDialogOpen,
    setIsVendorDialogOpen,
    isNewCategoryDialogOpen,
    setIsNewCategoryDialogOpen,
    currentVendor, 
    formData,
    setFormData,
    selectedCategory,
    handleInputChange,
    handleCategorySelect,
    handleAddCategory,
    handleCreateNewCategory,
    handleRemoveCategory,
    handleAddVendor,
    handleEditVendor,
    handleDeleteVendor,
    handleSubmit
  };
};
