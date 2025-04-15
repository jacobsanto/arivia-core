
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { useTemplateDialogs } from "@/hooks/useTemplateDialogs";

// Import the components
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
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    getTemplateById
  } = useChecklistTemplates();

  // Use the new custom hook for dialog management
  const {
    isCreateTemplateOpen,
    setIsCreateTemplateOpen,
    isEditTemplateOpen,
    setIsEditTemplateOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isUseTemplateOpen,
    setIsUseTemplateOpen,
    selectedTemplate,
    templateToDelete,
    setTemplateToDelete,
    selectedTemplateForUse,
    setSelectedTemplateForUse
  } = useTemplateDialogs();

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
      navigate("/");
      return undefined;
    }, [navigate]);
    return null;
  }
  
  const handleDeleteClick = (templateId: string) => {
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

  const handleDuplicateTemplate = (templateId: string) => {
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

  const handleUseTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setSelectedTemplateForUse(template);
      setIsUseTemplateOpen(true);
    }
  };

  const handleEditClick = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setIsEditTemplateOpen(true);
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
            onEdit={handleEditClick}
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
