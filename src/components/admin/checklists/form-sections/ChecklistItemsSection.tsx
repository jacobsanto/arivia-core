
import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistTemplateFormValues } from "@/types/checklistTypes";
import ChecklistItemField from "./ChecklistItemField";

interface ChecklistItemsSectionProps {
  form: UseFormReturn<ChecklistTemplateFormValues>;
}

const ChecklistItemsSection = ({ form }: ChecklistItemsSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Checklist Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ title: "" })}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No items added. Click "Add Item" to create checklist items.
            </p>
          ) : (
            fields.map((field, index) => (
              <ChecklistItemField 
                key={field.id}
                form={form}
                index={index}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistItemsSection;
