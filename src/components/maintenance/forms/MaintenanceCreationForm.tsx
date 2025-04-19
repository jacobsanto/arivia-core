
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";

import { maintenanceFormSchema, MaintenanceFormValues } from "./types";
import MaintenanceBasicInfo from "./MaintenanceBasicInfo";
import MaintenanceSchedule from "./MaintenanceSchedule";
import MaintenanceDetails from "./MaintenanceDetails";
import MaintenanceFormActions from "./MaintenanceFormActions";

interface MaintenanceCreationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const MaintenanceCreationForm: React.FC<MaintenanceCreationFormProps> = ({ onSubmit, onCancel }) => {
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

  const handleSubmit = (values: MaintenanceFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <MaintenanceBasicInfo form={form} />
        <MaintenanceSchedule form={form} />
        <MaintenanceDetails form={form} />
        
        {/* Use a regular div instead of FormField since photos is not in the schema */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Task Photos</p>
          <FileUpload
            onChange={(files) => {
              // Handle files separately since they're not part of the form schema
              const filesArray = Array.from(files);
              form.setValue('taskMedia', filesArray as any);
            }}
            accept="image/*"
            multiple
            maxFiles={5}
          />
          <p className="text-xs text-muted-foreground">
            Upload up to 5 photos related to the task (optional)
          </p>
        </div>
        
        <MaintenanceFormActions onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default MaintenanceCreationForm;
