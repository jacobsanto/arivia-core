
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckSquare, Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import ChecklistTemplateForm from "@/components/admin/checklists/ChecklistTemplateForm";
import ChecklistTemplateGrid from "@/components/admin/checklists/ChecklistTemplateGrid";
import ChecklistTemplateFilters from "@/components/admin/checklists/ChecklistTemplateFilters";
import { ChecklistTemplate } from "@/types/checklistTypes";

const AdminChecklists = () => {
  const {
    user
  } = useUser();
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
            <div>
              <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl">
                <CheckSquare className="mr-2 h-7 w-7" /> Checklist Templates
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight">
                Manage checklist templates for tasks and operations
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateTemplateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Template
          </Button>
        </div>
        
        <div className="space-y-6">
          <ChecklistTemplateFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
          
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
      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Checklist Template</DialogTitle>
          </DialogHeader>
          <ChecklistTemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setIsCreateTemplateOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Checklist Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <ChecklistTemplateForm
              template={selectedTemplate}
              onSubmit={handleEditTemplate}
              onCancel={() => setIsEditTemplateOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Use Template Dialog */}
      <Dialog open={isUseTemplateOpen} onOpenChange={setIsUseTemplateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Use Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Choose which task type to create using the "{selectedTemplateForUse?.name}" template:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4"
                onClick={() => {
                  navigate('/housekeeping');
                  setIsUseTemplateOpen(false);
                  toast.success("Template selected. Create a new housekeeping task to use it.");
                }}
              >
                <span className="text-lg mb-2">Housekeeping Task</span>
                <span className="text-xs text-muted-foreground text-center">
                  Create a housekeeping task with this checklist
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4"
                onClick={() => {
                  navigate('/maintenance');
                  setIsUseTemplateOpen(false);
                  toast.success("Template selected. Create a new maintenance task to use it.");
                }}
              >
                <span className="text-lg mb-2">Maintenance Task</span>
                <span className="text-xs text-muted-foreground text-center">
                  Create a maintenance task with this checklist
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChecklists;
