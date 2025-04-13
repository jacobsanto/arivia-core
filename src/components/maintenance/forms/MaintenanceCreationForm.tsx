
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ClipboardList } from "lucide-react";

import { maintenanceFormSchema, MaintenanceFormValues } from "./types";
import MaintenanceBasicInfo from "./MaintenanceBasicInfo";
import MaintenanceSchedule from "./MaintenanceSchedule";
import MaintenanceDetails from "./MaintenanceDetails";
import MaintenanceFormActions from "./MaintenanceFormActions";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import ChecklistTemplatePreview from "@/components/checklists/ChecklistTemplatePreview";
import { ChecklistItem } from "@/types/taskTypes";

interface MaintenanceCreationFormProps {
  onSubmit: (data: MaintenanceFormValues) => void;
  onCancel: () => void;
}

const MaintenanceCreationForm = ({ onSubmit, onCancel }: MaintenanceCreationFormProps) => {
  // Add states for template handling
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  
  // Get checklist templates
  const { templates, getTemplatesByType } = useChecklistTemplates();
  const maintenanceTemplates = getTemplatesByType("Maintenance");

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      property: "",
      priority: "",
      dueDate: "",
      assignee: "",
      description: "",
      location: "",
      requiredTools: "",
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handlePreviewTemplate = (template: any) => {
    setPreviewTemplate(template);
    setIsTemplatePreviewOpen(true);
  };

  const handleSubmit = (values: MaintenanceFormValues) => {
    // If a template is selected, add checklist items to the task
    let checklist: ChecklistItem[] = [];
    
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        checklist = template.items;
      }
    }
    
    const maintenanceData = {
      ...values,
      checklist
    };
    
    onSubmit(maintenanceData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <MaintenanceBasicInfo form={form} />
        <MaintenanceSchedule form={form} />
        
        {/* Template Selection (new section) */}
        <div className="space-y-4 border rounded-md p-4">
          <h3 className="text-md font-medium">Checklist Template</h3>
          
          {maintenanceTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {maintenanceTemplates.map(template => (
                <div key={template.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`template-${template.id}`}
                      name="template"
                      className="mr-2"
                      checked={selectedTemplateId === template.id}
                      onChange={() => handleTemplateSelect(template.id)}
                    />
                    <label htmlFor={`template-${template.id}`} className="text-sm font-medium">
                      {template.title}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({template.items.length} items)
                      </span>
                    </label>
                  </div>
                  <Button 
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center mt-2">
                <input
                  type="radio"
                  id="no-template"
                  name="template"
                  className="mr-2"
                  checked={selectedTemplateId === null}
                  onChange={() => setSelectedTemplateId(null)}
                />
                <label htmlFor="no-template" className="text-sm font-medium">
                  Create maintenance task without a checklist
                </label>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground text-sm">
                No maintenance templates available.
                Ask a super admin to create maintenance templates.
              </p>
            </div>
          )}
        </div>
        
        <MaintenanceDetails form={form} />
        <MaintenanceFormActions onCancel={onCancel} />
        
        {/* Template preview modal */}
        <ChecklistTemplatePreview
          template={previewTemplate}
          isOpen={isTemplatePreviewOpen}
          onClose={() => setIsTemplatePreviewOpen(false)}
          onUseTemplate={() => {
            if (previewTemplate) {
              handleTemplateSelect(previewTemplate.id);
              setIsTemplatePreviewOpen(false);
            }
          }}
          allowSelection={true}
        />
      </form>
    </Form>
  );
};

export default MaintenanceCreationForm;
