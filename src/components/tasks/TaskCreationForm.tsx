import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { getCleaningChecklist, generateCleaningSchedule } from "@/utils/cleaningChecklists";
import TaskTemplateSelector from "./TaskTemplateSelector";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  property: z.string().min(1, "Property is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignee: z.string().min(1, "Assignee is required"),
  description: z.string().optional(),
  isStayRelated: z.boolean().optional(),
  cleaningType: z.string().optional(),
  stayDuration: z.number().optional(),
  guestCheckIn: z.date().optional(),
  guestCheckOut: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const propertyOptions = [
  { label: "Villa Caldera", value: "Villa Caldera" },
  { label: "Villa Azure", value: "Villa Azure" },
  { label: "Villa Sunset", value: "Villa Sunset" },
  { label: "Villa Oceana", value: "Villa Oceana" },
  { label: "Villa Paradiso", value: "Villa Paradiso" },
];

const staffOptions = [
  { label: "Maria Kowalska", value: "Maria Kowalska" },
  { label: "Alex Chen", value: "Alex Chen" },
  { label: "Stefan Müller", value: "Stefan Müller" },
  { label: "Ana Rodriguez", value: "Ana Rodriguez" },
  { label: "Thomas Lindberg", value: "Thomas Lindberg" },
];

interface TaskCreationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  selectedTemplate?: any;
  onSelectTemplate?: (template: any) => void;
}

const TaskCreationForm = ({ 
  onSubmit, 
  onCancel, 
  selectedTemplate,
  onSelectTemplate 
}: TaskCreationFormProps) => {
  const [isStayRelated, setIsStayRelated] = useState(false);
  const [cleaningType, setCleaningType] = useState<string>("Standard");
  const [scheduledCleanings, setScheduledCleanings] = useState<string[]>([]);
  const [cleaningTypes, setCleaningTypes] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      property: "",
      priority: "Medium",
      dueDate: new Date(),
      assignee: "",
      description: "",
      isStayRelated: false,
      cleaningType: "Standard",
      stayDuration: undefined,
      guestCheckIn: undefined,
      guestCheckOut: undefined,
    },
  });

  const watchCheckIn = form.watch("guestCheckIn");
  const watchCheckOut = form.watch("guestCheckOut");

  useEffect(() => {
    if (isStayRelated && watchCheckIn && watchCheckOut) {
      const { scheduledCleanings, cleaningTypes } = generateCleaningSchedule(watchCheckIn, watchCheckOut);
      setScheduledCleanings(scheduledCleanings);
      setCleaningTypes(cleaningTypes);
    }
  }, [isStayRelated, watchCheckIn, watchCheckOut]);

  const handleSubmit = (data: TaskFormValues) => {
    let stayDuration;
    if (data.guestCheckIn && data.guestCheckOut) {
      stayDuration = Math.ceil(
        (data.guestCheckOut.getTime() - data.guestCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    const taskData = {
      ...data,
      templateId: selectedTemplate?.id,
      cleaningDetails: isStayRelated ? {
        cleaningType,
        stayDuration,
        scheduledCleanings,
        guestCheckIn: data.guestCheckIn?.toISOString(),
        guestCheckOut: data.guestCheckOut?.toISOString()
      } : undefined
    };

    onSubmit(taskData);
  };

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
    if (value) {
      // Fix: Call generateCleaningSchedule with proper arguments
      const schedule = generateCleaningSchedule(
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        'standard' // default cleaning type
      );
      console.log('Generated schedule:', schedule);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter housekeeping task title" {...field} />
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
                      <SelectValue placeholder="Select a property" />
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
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
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
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
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
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
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
        </div>

        {onSelectTemplate && (
          <TaskTemplateSelector 
            selectedTemplate={selectedTemplate} 
            onSelectTemplate={onSelectTemplate} 
          />
        )}

        <FormField
          control={form.control}
          name="isStayRelated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsStayRelated(checked === true);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Guest Stay Related Cleaning</FormLabel>
                <FormDescription>
                  Select if this task is related to a guest check-in/check-out or mid-stay cleaning
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {isStayRelated && (
          <div className="space-y-4 border rounded-md p-4">
            <h3 className="text-md font-medium">Guest Stay Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guestCheckIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Guest Check-In Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick check-in date</span>
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
                name="guestCheckOut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Guest Check-Out Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick check-out date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (watchCheckIn && date && date < watchCheckIn) {
                              return;
                            }
                            field.onChange(date);
                          }}
                          fromDate={watchCheckIn ? addDays(watchCheckIn, 1) : undefined}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Cleaning Type</FormLabel>
              <RadioGroup
                defaultValue="Standard"
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                onValueChange={(value) => setCleaningType(value)}
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Standard" />
                  </FormControl>
                  <FormLabel className="font-normal">Standard Cleaning</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Full" />
                  </FormControl>
                  <FormLabel className="font-normal">Full Cleaning</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Linen & Towel Change" />
                  </FormControl>
                  <FormLabel className="font-normal">Linen & Towel Change</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>

            {watchCheckIn && watchCheckOut && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Scheduled Cleanings</h4>
                  <div className="space-y-2">
                    {scheduledCleanings.map((date, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{format(new Date(date), "PPP")}</span>
                        <span className="font-medium">{cleaningTypes[index] || "Standard"}</span>
                      </div>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    This schedule is based on our standard cleaning policy for the stay duration.
                  </FormDescription>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description & Special Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any specific housekeeping instructions or details"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Housekeeping Task</Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskCreationForm;
