
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ChecklistPageHeader from "@/components/admin/checklists/ChecklistPageHeader";
import ChecklistTemplateGrid from "@/components/admin/checklists/ChecklistTemplateGrid";
import ChecklistTemplateFilters from "@/components/admin/checklists/ChecklistTemplateFilters";
import TemplateFormDialog from "@/components/admin/checklists/dialogs/TemplateFormDialog";
import DeleteTemplateDialog from "@/components/admin/checklists/dialogs/DeleteTemplateDialog";
import UseTemplateDialog from "@/components/admin/checklists/dialogs/UseTemplateDialog";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { ChecklistTemplate, ChecklistItem } from "@/types/checklistTypes";
import { toast } from "sonner";

const AdminChecklists = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    templates,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    getTemplateById
  } = useChecklistTemplates();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleUseTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsUseDialogOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const items: ChecklistItem[] = formData.items.map((item: { title: string }, index: number) => ({
        id: `item-${index}`,
        title: item.title,
        text: item.title,
        completed: false
      }));

      const templateData = {
        ...formData,
        items,
        createdBy: 'current-user',
        isActive: true
      };

      if (selectedTemplate) {
        await handleEditTemplate(selectedTemplate.id, templateData);
        toast.success("Template updated successfully");
      } else {
        await handleCreateTemplate(templateData);
        toast.success("Template created successfully");
      }
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedTemplate) {
      try {
        await handleDeleteTemplate(selectedTemplate.id);
        toast.success("Template deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedTemplate(null);
      } catch (error) {
        toast.error("Failed to delete template");
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Checklist Templates - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <ChecklistPageHeader onCreateTemplate={handleCreateNew} />
          </div>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        <ChecklistTemplateFilters
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        <ChecklistTemplateGrid
          templates={templates}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUse={handleUseTemplate}
        />
      </div>

      <TemplateFormDialog
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleFormSubmit}
        template={selectedTemplate}
      />

      <DeleteTemplateDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onConfirm={handleDeleteConfirm}
        templateName={selectedTemplate?.name || ''}
      />

      <UseTemplateDialog
        isOpen={isUseDialogOpen}
        onClose={() => {
          setIsUseDialogOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </div>
  );
};

export default AdminChecklists;
