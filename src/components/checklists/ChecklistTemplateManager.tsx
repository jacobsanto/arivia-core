
import React, { useState } from "react";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { useUser } from "@/contexts/UserContext";
import ChecklistTemplatesList from "./ChecklistTemplatesList";
import ChecklistTemplateDialog from "./ChecklistTemplateDialog";
import ChecklistTemplatePreview from "./ChecklistTemplatePreview";
import { ChecklistTemplateFormValues } from "@/types/checklistTemplates";

const ChecklistTemplateManager: React.FC = () => {
  const { 
    templates, 
    selectedTemplate, 
    setSelectedTemplate,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen, 
    createTemplate, 
    updateTemplate 
  } = useChecklistTemplates();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { user } = useUser();
  const isSuperAdmin = user?.role === "superadmin";

  const handleCreateSubmit = async (values: ChecklistTemplateFormValues) => {
    await createTemplate(values);
  };

  const handleUpdateSubmit = async (values: ChecklistTemplateFormValues) => {
    if (selectedTemplate) {
      await updateTemplate(selectedTemplate.id, values);
    }
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">
          Only super administrators can manage checklist templates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ChecklistTemplatesList />

      {/* Create template dialog */}
      <ChecklistTemplateDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        title="Create Checklist Template"
      />

      {/* Edit template dialog */}
      {selectedTemplate && (
        <ChecklistTemplateDialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: selectedTemplate.title,
            description: selectedTemplate.description || "",
            taskType: selectedTemplate.taskType,
            items: selectedTemplate.items,
            isActive: selectedTemplate.isActive
          }}
          title="Edit Checklist Template"
        />
      )}

      {/* Preview template dialog */}
      <ChecklistTemplatePreview
        template={selectedTemplate}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};

export default ChecklistTemplateManager;
