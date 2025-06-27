
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChecklistPageHeader from "@/components/admin/checklists/ChecklistPageHeader";
import ChecklistTemplateFilters from "@/components/admin/checklists/ChecklistTemplateFilters";
import ChecklistTemplateGrid from "@/components/admin/checklists/ChecklistTemplateGrid";
import { TemplateFormDialog } from "@/components/admin/checklists/dialogs/TemplateFormDialog";
import { DeleteTemplateDialog } from "@/components/admin/checklists/dialogs/DeleteTemplateDialog";
import { UseTemplateDialog } from "@/components/admin/checklists/dialogs/UseTemplateDialog";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "@/types/checklistTypes";
import { useUser } from "@/contexts/UserContext";

const AdminChecklists: React.FC = () => {
  const { user } = useUser();
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  const {
    filteredTemplates,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate
  } = useChecklistTemplates();

  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin";

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setFormDialogOpen(true);
  };

  const handleDelete = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleUse = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setUseDialogOpen(true);
  };

  const handleFormSubmit = async (data: ChecklistTemplateFormValues) => {
    try {
      const templateData = {
        ...data,
        createdBy: user?.id || '',
        isActive: true
      };

      if (editingTemplate) {
        await handleEditTemplate(editingTemplate.id, templateData);
      } else {
        await handleCreateTemplate(templateData);
      }
      
      setFormDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEditFormSubmit = async (data: ChecklistTemplateFormValues) => {
    if (!editingTemplate) return;
    
    try {
      await handleEditTemplate(editingTemplate.id, {
        ...data,
        createdBy: editingTemplate.createdBy,
        isActive: editingTemplate.isActive
      });
      setFormDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedTemplate) {
      await handleDeleteTemplate(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Checklist Templates</CardTitle>
          <CardDescription>
            Manage checklist templates for various tasks and operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChecklistPageHeader onCreateNew={isAdmin ? handleCreateNew : undefined} />
          
          <ChecklistTemplateFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
          
          <ChecklistTemplateGrid
            templates={filteredTemplates}
            isLoading={isLoading}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
            onUse={handleUse}
          />
        </CardContent>
      </Card>

      <TemplateFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        template={editingTemplate}
        onSubmit={editingTemplate ? handleEditFormSubmit : handleFormSubmit}
      />

      <DeleteTemplateDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        template={selectedTemplate}
        onConfirm={handleConfirmDelete}
      />

      <UseTemplateDialog
        open={useDialogOpen}
        onOpenChange={setUseDialogOpen}
        template={selectedTemplate}
      />
    </div>
  );
};

export default AdminChecklists;
