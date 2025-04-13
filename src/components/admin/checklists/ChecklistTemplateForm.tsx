
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  ChecklistTemplate,
  checklistTemplateSchema,
  ChecklistTemplateFormValues,
} from "@/types/checklistTypes";
import ChecklistBasicInfo from "./form-sections/ChecklistBasicInfo";
import ChecklistItemsSection from "./form-sections/ChecklistItemsSection";

interface ChecklistTemplateFormProps {
  onSubmit: (data: ChecklistTemplateFormValues) => void;
  onCancel: () => void;
  template?: ChecklistTemplate;
}

const ChecklistTemplateForm = ({ 
  onSubmit, 
  onCancel, 
  template 
}: ChecklistTemplateFormProps) => {
  const form = useForm<ChecklistTemplateFormValues>({
    resolver: zodResolver(checklistTemplateSchema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description,
          category: template.category,
          items: template.items.map(item => ({ title: item.title })),
        }
      : {
          name: "",
          description: "",
          category: "Housekeeping",
          items: [{ title: "" }],
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <ChecklistBasicInfo control={form.control} />
        
        {/* Checklist Items Section */}
        <ChecklistItemsSection form={form} />

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {template ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChecklistTemplateForm;
