
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { MaintenanceFormValues } from "./schema";
import { FormFieldWrapper } from "./FormFieldWrapper";

interface EmailFieldProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const EmailField: React.FC<EmailFieldProps> = ({ form }) => {
  return (
    <FormFieldWrapper
      form={form}
      name="maintenanceEmail"
      label="Maintenance Notification Email"
      description="Email to receive maintenance notifications"
    >
      <Input 
        type="email" 
        placeholder="maintenance@arivia-villas.com"
      />
    </FormFieldWrapper>
  );
};
