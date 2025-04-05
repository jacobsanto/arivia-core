
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { MaintenanceTask, MaintenanceReport as MaintenanceReportType } from "@/hooks/useMaintenanceTasks";

interface MaintenanceReportProps {
  task: MaintenanceTask;
  onClose: () => void;
  onSubmit: (report: MaintenanceReportType) => void;
  report: MaintenanceReportType;
}

const reportSchema = z.object({
  timeSpent: z.string().min(1, "Time spent is required"),
  materialsUsed: z.string().min(1, "Materials used is required"),
  cost: z.string().min(1, "Cost is required"),
  notes: z.string(),
});

const MaintenanceReport = ({
  task,
  onClose,
  onSubmit,
  report,
}: MaintenanceReportProps) => {
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      timeSpent: report.timeSpent || "",
      materialsUsed: report.materialsUsed || "",
      cost: report.cost || "",
      notes: report.notes || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof reportSchema>) => {
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">Maintenance Report</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="timeSpent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Spent</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2 hours 30 minutes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="materialsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials Used</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Replacement parts, tools" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. $125.75" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how the issue was resolved and any follow-up needed" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Complete Task
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default MaintenanceReport;
