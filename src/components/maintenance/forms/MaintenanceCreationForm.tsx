import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

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
        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Photos</FormLabel>
              <FormControl>
                <FileUpload
                  onChange={(files) => field.onChange(Array.from(files))}
                  accept="image/*"
                  multiple
                  maxFiles={5}
                />
              </FormControl>
              <FormDescription>
                Upload up to 5 photos related to the task (optional)
              </FormDescription>
            </FormItem>
          )}
        />
        <MaintenanceFormActions onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default MaintenanceCreationForm;
