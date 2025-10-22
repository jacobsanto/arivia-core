import { useAppMutation } from "@/hooks/query/useAppMutation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CreateTaskInput = {
  title: string;
  property?: string; // name; we store property_id null for now
  priority: string;
  dueDate: string; // ISO
  assignee?: string | null;
  description?: string | null;
  task_type?: string;
};

export function useCreateTask() {
  const qc = useQueryClient();

  return useAppMutation<any, Error, CreateTaskInput, unknown>(
    async (values) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const payload: any = {
        title: values.title,
        priority: values.priority,
        due_date: values.dueDate,
        description: values.description ?? null,
        status: "pending",
        assigned_to: values.assignee ?? null,
        property_id: null, // map name->id in future iteration
        task_type: values.task_type || "general",
      };

      const { data, error } = await supabase
        .from("housekeeping_tasks")
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
