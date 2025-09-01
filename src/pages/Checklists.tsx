import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { TemplatesGrid } from '@/components/checklists/TemplatesGrid';
import { TemplateEditorModal } from '@/components/checklists/TemplateEditorModal';
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { ChecklistTemplate } from '@/types/checklists.types';

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

  return (
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
        onDuplicateTemplate={duplicateTemplate}
        onDeleteTemplate={deleteTemplate}
        getTemplateStats={getTemplateStats}
      />

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={createTemplate}
        onUpdate={updateTemplate}
        template={editingTemplate}
        isLoading={loading}
      />
    </div>
  );
};

export default Checklists;