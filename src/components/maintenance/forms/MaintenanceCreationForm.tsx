
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { maintenanceFormSchema, MaintenanceFormValues } from "./types";
import MaintenanceBasicInfo from "./MaintenanceBasicInfo";
import MaintenanceSchedule from "./MaintenanceSchedule";
import MaintenanceDetails from "./MaintenanceDetails";

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <MaintenanceBasicInfo form={form} />
        <MaintenanceSchedule form={form} />
        <MaintenanceDetails form={form} />
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Task Photos</p>
          <FileUpload
            onChange={(files) => {
              const filesArray = Array.from(files);
              form.setValue('photos', filesArray as any);
            }}
            accept="image/*"
            multiple
            maxFiles={5}
          />
          <p className="text-xs text-muted-foreground">
            Upload up to 5 photos related to the task (optional)
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Form>
  );
};

export default MaintenanceCreationForm;
