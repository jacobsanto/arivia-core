import { useAppMutation } from "@/hooks/query/useAppMutation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CreateTaskInput = {
  title: string;
  property: string;
  priority: string;
  dueDate: string; // ISO
  assignee?: string | null;
  description?: string | null;
};

export function useCreateTask() {
  const qc = useQueryClient();

  return useAppMutation<any, Error, CreateTaskInput, unknown>(
    async (values) => {
      const payload = {
        title: values.title,
        property: values.property,
        priority: values.priority,
        due_date: values.dueDate,
        assignee: values.assignee ?? null,
        description: values.description ?? null,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    {
      successTitle: "Task created",
      onSuccess: async () => {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["tasks"] }),
          qc.invalidateQueries({ queryKey: ["housekeeping-tasks"] }),
        ]);
      },
    }
  );
}
