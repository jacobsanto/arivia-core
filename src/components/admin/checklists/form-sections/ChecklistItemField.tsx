
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChecklistTemplateFormValues } from "@/types/checklistTypes";

interface ChecklistItemFieldProps {
  form: UseFormReturn<ChecklistTemplateFormValues>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

const ChecklistItemField = ({ 
  form, 
  index, 
  onRemove, 
  canRemove 
}: ChecklistItemFieldProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <FormField
        control={form.control}
        name={`items.${index}.title`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input
                placeholder={`Item ${index + 1}`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
};

export default ChecklistItemField;
