
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Save } from "lucide-react";
import { cleaningTaskFormSchema, CleaningTaskFormValues } from "@/types/taskTypes";
import { useTaskDrafts } from "@/hooks/task-drafts/useTaskDrafts";
import { Badge } from "@/components/ui/badge";

interface CleaningTaskFormProps {
  onSubmit: (data: CleaningTaskFormValues) => void;
  onCancel: () => void;
  initialValues?: Partial<CleaningTaskFormValues>;
  draftId?: string;
}

const CleaningTaskForm: React.FC<CleaningTaskFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  draftId,
}) => {
  const form = useForm<CleaningTaskFormValues>({
    resolver: zodResolver(cleaningTaskFormSchema),
    defaultValues: initialValues || {
      title: "",
      property: "",
      roomType: "",
      dueDate: undefined,
      assignedTo: "",
      priority: "Medium",
      description: "",
    },
  });

  // Initialize task drafts hook
  const {
    drafts,
    currentDraftId,
    autosaveDraft,
    saveDraft,
    loadDraft,
  } = useTaskDrafts({
    taskType: 'housekeeping',
    autosaveInterval: 3000,
    notifyOnAutosave: false
  });

  // Watch form values for autosave
  const formValues = form.watch();
  
  // Effect for autosaving
  useEffect(() => {
    const formData = form.getValues();
    if (Object.keys(formData).length > 0 && formData.title) {
      autosaveDraft({
        ...formData,
        id: currentDraftId || draftId
      });
    }
  }, [formValues, autosaveDraft, currentDraftId, draftId]);
  
  // Load draft if draftId is provided
  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId) {
        const draftData = await loadDraft(draftId);
        if (draftData) {
          // Update form with draft data
          Object.entries(draftData).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'lastUpdated' && key !== 'type') {
              form.setValue(key as any, value);
            }
          });
        }
      }
    };
    
    loadDraftData();
  }, [draftId, loadDraft, form]);

  const propertyOptions = [
    { label: "Villa Caldera", value: "Villa Caldera" },
    { label: "Villa Azure", value: "Villa Azure" },
    { label: "Villa Sunset", value: "Villa Sunset" },
    { label: "Villa Oceana", value: "Villa Oceana" },
  ];

  const roomOptions = [
    { label: "Master Bedroom", value: "Master Bedroom" },
    { label: "Guest Room", value: "Guest Room" },
    { label: "Living Room", value: "Living Room" },
    { label: "Kitchen", value: "Kitchen" },
    { label: "Bathroom", value: "Bathroom" },
    { label: "Entire Villa", value: "Entire Villa" },
  ];

  const staffOptions = [
    { label: "Maria Kowalska", value: "Maria Kowalska" },
    { label: "Alex Chen", value: "Alex Chen" },
    { label: "Stefan Müller", value: "Stefan Müller" },
    { label: "Ana Rodriguez", value: "Ana Rodriguez" },
  ];

  const handleSubmit = form.handleSubmit(async (data) => {
    // Save one last time before submitting
    await saveDraft({
      ...data,
      id: currentDraftId || draftId
    });
    
    onSubmit(data);
  });
  
  // Manual save handler
  const handleManualSave = async () => {
    const formData = form.getValues();
    await saveDraft({
      ...formData,
      id: currentDraftId || draftId
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Task Details</h3>
          
          {currentDraftId && (
            <Badge variant="outline" className="text-xs">
              Draft Saving Enabled
            </Badge>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="property"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roomType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to staff" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staffOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
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
                  placeholder="Enter task description or special instructions"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Form>
  );
};

export default CleaningTaskForm;
