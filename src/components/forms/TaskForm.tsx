import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, TextAreaField, FormErrorSummary, SubmitButton } from "@/components/form/FormKit";
import { useCreateTask } from "@/hooks/mutations/useTasksMutations";
import { useToast } from "@/hooks/use-toast";

const TaskSchema = z.object({
  title: z.string().min(3, "Title is required"),
  property: z.string().min(1, "Property is required"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  dueDate: z.coerce.date(),
  assignee: z.string().optional(),
  description: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof TaskSchema>;

export interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  onSuccess?: (task: any) => void;
}

export function TaskForm({ defaultValues, onSuccess }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      property: "",
      priority: "Medium",
      dueDate: new Date(),
      description: "",
      ...defaultValues,
    },
  });

  const { toast } = useToast();
  const createTask = useCreateTask();

  const handleSubmit = async (values: TaskFormValues) => {
    const payload = {
      title: values.title,
      property: values.property,
      priority: values.priority,
      dueDate: values.dueDate.toISOString(),
      assignee: values.assignee || null,
      description: values.description || null,
    } as const;
    const res = await createTask.mutateAsync(payload);
    toast({ title: "Task created", description: values.title });
    onSuccess?.(res);
  };
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormErrorSummary errors={errors} />

      <InputField label="Title" required {...form.register("title")} />
      <InputField label="Property" required {...form.register("property")} />
      <InputField label="Priority (Low/Medium/High)" {...form.register("priority")} />
      <InputField type="date" label="Due Date" required {...form.register("dueDate")} />
      <InputField label="Assignee (optional)" {...form.register("assignee")} />
      <TextAreaField label="Description" rows={4} {...form.register("description")} />

      <div className="pt-2">
        <SubmitButton isLoading={createTask.isPending}>Create Task</SubmitButton>
      </div>
    </form>
  );
}

export default TaskForm;
