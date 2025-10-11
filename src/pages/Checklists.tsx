import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { TemplatesGrid } from '@/components/checklists/TemplatesGrid';
import { TemplateEditorModal } from '@/components/checklists/TemplateEditorModal';
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { ChecklistTemplate } from '@/types/checklistTypes';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ui/error-boundary';
import { logger } from '@/services/logger';

const Checklists: React.FC = () => {
  const { 
    templates, 
    loading, 
    error, 
    fetchTemplates, 
    createTemplate, 
    updateTemplate, 
    duplicateTemplate, 
    deleteTemplate,
    getTemplateStats 
  } = useChecklistTemplates();

  // Error handling
  if (error) {
    logger.error("Checklists error", { error });
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Templates</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchTemplates}>Try Again</Button>
        </div>
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | undefined>();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(undefined);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Failed to Load Templates</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const handleSaveTemplate = async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTemplate(templateData);
      setIsModalOpen(false);
      setEditingTemplate(undefined);
      toast.success("Template created successfully");
    } catch (error) {
      logger.error("Error creating template", { error });
      toast.error("Failed to create template");
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: Partial<ChecklistTemplate>) => {
    try {
      await updateTemplate(templateId, updates);
      setIsModalOpen(false);
      setEditingTemplate(undefined);
      toast.success("Template updated successfully");
    } catch (error) {
      logger.error("Error updating template", { error });
      toast.error("Failed to update template");
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await duplicateTemplate(templateId);
      toast.success("Template duplicated successfully");
    } catch (error) {
      logger.error("Error duplicating template", { error });
      toast.error("Failed to duplicate template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast.success("Template deleted successfully");
    } catch (error) {
      logger.error("Error deleting template", { error });
      toast.error("Failed to delete template");
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-8 w-8" />
              Checklist Templates
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage standardized checklists to ensure quality control and consistency across all operations
            </p>
          </div>
          
          <Button onClick={handleCreateTemplate} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Templates Grid */}
        <TemplatesGrid
          templates={templates}
          loading={loading}
          onCreateTemplate={handleCreateTemplate}
          onEditTemplate={handleEditTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          getTemplateStats={getTemplateStats}
        />

        {/* Template Editor Modal */}
        <TemplateEditorModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTemplate}
          onUpdate={handleUpdateTemplate}
          template={editingTemplate}
          isLoading={loading}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Checklists;