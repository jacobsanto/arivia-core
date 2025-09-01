import React, { useState } from 'react';
import { TemplatesList } from '@/components/recurring-tasks/TemplatesList';
import { TemplateEditorModal } from '@/components/recurring-tasks/TemplateEditorModal';
import { useRecurringTasks } from '@/hooks/useRecurringTasks';
import { RecurringTaskTemplate } from '@/types/recurringTasks.types';

const RecurringTasks: React.FC = () => {
  const {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateStatus,
    getRuleDescription,
    getTaskTypeLabel,
    getApplicabilityText,
    getStaffName,
    getProperties,
    getStaff
  } = useRecurringTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringTaskTemplate | undefined>();

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: RecurringTaskTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(undefined);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Recurring Tasks</h1>
        <p className="text-muted-foreground mt-2">
          Automate routine maintenance and cleaning tasks with templates that generate work automatically
        </p>
      </div>

      {/* Templates List */}
      <TemplatesList
        templates={templates}
        onCreateTemplate={handleCreateTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={deleteTemplate}
        onToggleStatus={toggleTemplateStatus}
        getRuleDescription={getRuleDescription}
        getTaskTypeLabel={getTaskTypeLabel}
        getApplicabilityText={getApplicabilityText}
        getStaffName={getStaffName}
        loading={loading}
      />

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={addTemplate}
        onUpdate={updateTemplate}
        template={editingTemplate}
        properties={getProperties()}
        staff={getStaff()}
        isLoading={loading}
      />
    </div>
  );
};

export default RecurringTasks;