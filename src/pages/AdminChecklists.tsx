
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { ChecklistTemplate } from "@/types/checklistTypes";

// Import the new components
import ChecklistPageHeader from "@/components/admin/checklists/ChecklistPageHeader";
import ChecklistTemplateGrid from "@/components/admin/checklists/ChecklistTemplateGrid";
import ChecklistTemplateFilters from "@/components/admin/checklists/ChecklistTemplateFilters";
import DeleteTemplateDialog from "@/components/admin/checklists/dialogs/DeleteTemplateDialog";
import UseTemplateDialog from "@/components/admin/checklists/dialogs/UseTemplateDialog";
import TemplateFormDialog from "@/components/admin/checklists/dialogs/TemplateFormDialog";

const AdminChecklists = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    filteredTemplates,
    isCreateTemplateOpen,
    setIsCreateTemplateOpen,
    isEditTemplateOpen,
    setIsEditTemplateOpen,
    selectedTemplate,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    selectTemplateForEdit,
    getTemplateById
  } = useChecklistTemplates();

  // State for template operations
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<ChecklistTemplate | null>(null);

  // Add swipe gesture to navigate back
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeRight: () => {
      if (isMobile) {
        navigate(-1);
      }
    }
  });

  // Check for superadmin/admin access
  if (user?.role !== "superadmin" && user?.role !== "administrator") {
    // Redirect non-admins away
    React.useEffect(() => {
      toast.error("Access denied", {
        description: "You need admin privileges to access this area"
      });
      navigate("/");
    }, [navigate]);
    return null;
  }
  
  const handleDeleteClick = (templateId: number) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete !== null) {
      handleDeleteTemplate(templateToDelete);
      setTemplateToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDuplicateTemplate = (templateId: number) => {
    const template = getTemplateById(templateId);
    if (template) {
      const duplicatedData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        items: template.items.map(item => ({ title: item.title }))
      };
      handleCreateTemplate(duplicatedData);
    }
  };

  const handleUseTemplate = (templateId: number) => {
    const template = getTemplateById(templateId);
    if (template) {
      setSelectedTemplateForUse(template);
      setIsUseTemplateOpen(true);
    }
  };

  // Add swipe gesture props
  const gestureProps = isMobile ? {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } : {};
  
  return (
    <div {...gestureProps}>
      <Helmet>
        <title>Checklist Management - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Page header */}
        <ChecklistPageHeader onCreateTemplate={() => setIsCreateTemplateOpen(true)} />
        
        <div className="space-y-6">
          {/* Filters */}
          <ChecklistTemplateFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
          
          {/* Grid of templates */}
          <ChecklistTemplateGrid
            templates={filteredTemplates}
            onEdit={selectTemplateForEdit}
            onDelete={handleDeleteClick}
            onDuplicate={handleDuplicateTemplate}
            onUse={handleUseTemplate}
          />
        </div>
      </div>
      
      {/* Create Template Dialog */}
      <TemplateFormDialog 
        isOpen={isCreateTemplateOpen} 
        onOpenChange={setIsCreateTemplateOpen}
        title="Create Checklist Template"
        onSubmit={handleCreateTemplate}
      />
      
      {/* Edit Template Dialog */}
      <TemplateFormDialog 
        isOpen={isEditTemplateOpen} 
        onOpenChange={setIsEditTemplateOpen}
        title="Edit Checklist Template"
        template={selectedTemplate!}
        onSubmit={handleEditTemplate}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteTemplateDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
      
      {/* Use Template Dialog */}
      <UseTemplateDialog 
        isOpen={isUseTemplateOpen}
        onOpenChange={setIsUseTemplateOpen}
        selectedTemplate={selectedTemplateForUse}
      />
    </div>
  );
};

export default AdminChecklists;
