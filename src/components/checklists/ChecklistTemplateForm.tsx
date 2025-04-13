
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { ChecklistTemplateFormValues } from "@/types/checklistTemplates";
import { ChecklistItem } from "@/types/taskTypes";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  taskType: z.string().min(1, "Task type is required"),
  items: z.array(
    z.object({
      id: z.number(),
      title: z.string().min(1, "Item title is required"),
      completed: z.boolean()
    })
  ).min(1, "At least one checklist item is required"),
  isActive: z.boolean().default(true)
});

interface ChecklistTemplateFormProps {
  initialData?: Partial<ChecklistTemplateFormValues>;
  onSubmit: (values: ChecklistTemplateFormValues) => void;
  onCancel: () => void;
}

const ChecklistTemplateForm: React.FC<ChecklistTemplateFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const form = useForm<ChecklistTemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      taskType: initialData?.taskType || "Housekeeping",
      items: initialData?.items || [{ id: 1, title: "", completed: false }],
      isActive: initialData?.isActive ?? true
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    name: "items",
    control: form.control
  });

  const handleSubmit = (values: ChecklistTemplateFormValues) => {
    // Ensure each item has a unique ID
    const formattedItems = values.items.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      completed: false // Always set completed to false for template items
    }));

    onSubmit({
      ...values,
      items: formattedItems
    });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  const addNewItem = () => {
    const newId = fields.length > 0
      ? Math.max(...fields.map(field => field.id)) + 1
      : 1;
    
    append({ id: newId, title: "", completed: false });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter template title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter template description"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taskType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Task Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Housekeeping" />
                    </FormControl>
                    <FormLabel className="font-normal">Housekeeping</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Maintenance" />
                    </FormControl>
                    <FormLabel className="font-normal">Maintenance</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Checklist Items</FormLabel>
            <Button type="button" size="sm" variant="outline" onClick={addNewItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          {fields.length === 0 ? (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground text-sm">No items added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 p-2 border rounded-md bg-background"
                >
                  <div className="flex flex-col items-center mr-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <span className="sr-only">Move up</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === fields.length - 1}
                    >
                      <span className="sr-only">Move down</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`items.${index}.title`}
                      render={({ field }) => (
                        <FormControl>
                          <Input placeholder="Enter item description" {...field} />
                        </FormControl>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {form.formState.errors.items?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.items.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Active Template
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this template available for selection when creating tasks
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChecklistTemplateForm;
