
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChecklistTemplate,
  checklistTemplateSchema,
  ChecklistTemplateFormValues,
  CHECKLIST_CATEGORIES
} from "@/types/checklistTypes";
import { Card, CardContent } from "@/components/ui/card";

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

  // Use useFieldArray hook to manage the dynamic items array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter template name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CHECKLIST_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter template description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
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
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}

              {fields.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No items added. Click "Add Item" to create checklist items.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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
