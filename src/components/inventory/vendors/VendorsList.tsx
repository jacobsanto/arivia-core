
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import VendorTable from "./VendorTable";
import VendorDialog from "./VendorDialog";
import NewCategoryDialog from "./NewCategoryDialog";
import { useVendorManagement } from "./useVendorManagement";

const VendorsList = () => {
  const {
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
  } = useVendorManagement();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Vendors</CardTitle>
        <Button onClick={handleAddVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </CardHeader>
      
      <CardContent>
        <VendorTable 
          vendors={vendors} 
          onEditVendor={handleEditVendor} 
          onDeleteVendor={handleDeleteVendor} 
        />
      </CardContent>

      {/* Vendor Dialog */}
      <VendorDialog
        isOpen={isVendorDialogOpen}
        onOpenChange={setIsVendorDialogOpen}
        title={currentVendor ? "Edit Vendor" : "Add New Vendor"}
        description={currentVendor ? "Update vendor details" : "Add a new supplier to your inventory system"}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleAddCategory={handleAddCategory}
        handleRemoveCategory={handleRemoveCategory}
        handleCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        categories={categories}
        onOpenNewCategoryDialog={() => setIsNewCategoryDialogOpen(true)}
        onSubmit={handleSubmit}
        isEditing={!!currentVendor}
      />

      {/* New Category Dialog */}
      <NewCategoryDialog
        isOpen={isNewCategoryDialogOpen}
        onOpenChange={setIsNewCategoryDialogOpen}
        onAddCategory={handleCreateNewCategory}
      />
    </Card>
  );
};

export default VendorsList;
