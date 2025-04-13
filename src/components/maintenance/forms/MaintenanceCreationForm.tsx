
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
  onSubmit: (data: MaintenanceFormValues) => void;
  onCancel: () => void;
}

const MaintenanceCreationForm = ({ onSubmit, onCancel }: MaintenanceCreationFormProps) => {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <MaintenanceBasicInfo form={form} />
        <MaintenanceSchedule form={form} />
        <MaintenanceDetails form={form} />
        <MaintenanceFormActions onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default MaintenanceCreationForm;
