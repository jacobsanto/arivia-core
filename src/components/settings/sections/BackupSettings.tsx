// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { Form } from "@/components/ui/form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { z } from "zod";
import { Download, Upload, Archive, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const backupSettingsSchema = z.object({
  autoBackupEnabled: z.boolean(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]),
  retentionDays: z.number().min(1).max(365),
  includeUserData: z.boolean(),
  includeSystemSettings: z.boolean(),
  includeAuditLogs: z.boolean(),
  compressionEnabled: z.boolean(),
});

type BackupSettingsFormValues = z.infer<typeof backupSettingsSchema>;

const defaultBackupValues: BackupSettingsFormValues = {
  autoBackupEnabled: true,
  backupFrequency: "weekly",
  retentionDays: 30,
  includeUserData: true,
  includeSystemSettings: true,
  includeAuditLogs: false,
  compressionEnabled: true,
};

interface BackupRecord {
  id: string;
  backup_name: string;
  created_at: string;
  created_by: string;
  restored_at?: string;
}

const BackupSettings: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
  } = useSettingsForm({
    category: 'backup',
    defaultValues: defaultBackupValues,
    schema: backupSettingsSchema,
    onAfterSave: () => {
      toast.success("Backup settings updated successfully");
    },
  });

  // Load existing backups
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('settings_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error("Failed to load backup history");
    } finally {
      setLoadingBackups(false);
    }
  };

  const createManualBackup = async () => {
    setCreatingBackup(true);
    try {
      const backupName = `Manual backup ${new Date().toLocaleString()}`;
      
      const { data, error } = await supabase.rpc('backup_all_settings', {
        backup_name: backupName
      });

      if (error) throw error;

      toast.success("Backup created successfully", {
        description: "Settings have been backed up"
      });
      
      loadBackups(); // Refresh the list
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error("Failed to create backup", {
        description: "Please try again"
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm("Are you sure you want to restore this backup? Current settings will be overwritten.")) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('restore_settings_backup', {
        backup_id: backupId
      });

      if (error) throw error;

      toast.success("Backup restored successfully", {
        description: "Settings have been restored. Please refresh the page."
      });
      
      loadBackups(); // Refresh the list
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error("Failed to restore backup", {
        description: "Please try again"
      });
    }
  };

  const exportSettings = () => {
    // Get current form values
    const settings = form.getValues();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success("Settings exported successfully");
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        form.reset(settings);
        toast.success("Settings imported successfully", {
          description: "Don't forget to save the changes"
        });
      } catch (error) {
        toast.error("Failed to import settings", {
          description: "Invalid file format"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Auto Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Automatic Backups
              </CardTitle>
              <CardDescription>
                Configure automatic backup scheduling for system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="autoBackupEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Auto Backup</FormLabel>
                      <FormDescription>
                        Automatically create backups on schedule
                      </FormDescription>
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

              {form.watch("autoBackupEnabled") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="backupFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backup Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often to create automatic backups
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="retentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retention Period (Days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormDescription>
                            How long to keep backup files
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Content */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Content</CardTitle>
              <CardDescription>
                Choose what data to include in backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="includeSystemSettings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">System Settings</FormLabel>
                      <FormDescription>
                        Include all system configuration settings
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="includeUserData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">User Data</FormLabel>
                      <FormDescription>
                        Include user profiles and preferences
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="includeAuditLogs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Audit Logs</FormLabel>
                      <FormDescription>
                        Include system audit and change logs
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="compressionEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Compression</FormLabel>
                      <FormDescription>
                        Compress backup files to save space
                      </FormDescription>
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
            </CardContent>
          </Card>

          {/* Manual Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Manual Operations
              </CardTitle>
              <CardDescription>
                Create backups and import/export settings manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={createManualBackup}
                  disabled={creatingBackup}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  {creatingBackup ? "Creating..." : "Create Backup"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={exportSettings}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Settings
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={!isDirty || isSaving}
            >
              Reset Changes
            </Button>
            <div className="flex gap-2">
              {isDirty && (
                <Badge variant="secondary">Unsaved changes</Badge>
              )}
              <Button 
                type="submit" 
                disabled={!isDirty || isSaving}
                className="min-w-20"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Separator />

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            View and restore previous backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBackups ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading backup history...
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No backups found
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{backup.backup_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(backup.created_at).toLocaleString()}
                      {backup.restored_at && (
                        <span className="ml-2 text-green-600">
                          • Restored: {new Date(backup.restored_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restoreBackup(backup.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;