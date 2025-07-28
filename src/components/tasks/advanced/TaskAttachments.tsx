import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Download, Trash2, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  user_id: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  taskType: "housekeeping" | "maintenance";
}

const TaskAttachments = ({ taskId, taskType }: TaskAttachmentsProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttachments();
  }, [taskId, taskType]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_attachments")
        .select(`
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          created_at,
          user_id
        `)
        .eq("task_id", taskId)
        .eq("task_type", taskType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast({
        title: "Error",
        description: "Failed to load attachments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      for (const file of files) {
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('arivia-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save attachment record
        const { error: insertError } = await supabase
          .from("task_attachments")
          .insert({
            task_id: taskId,
            task_type: taskType,
            user_id: user.user.id,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
          });

        if (insertError) throw insertError;
      }

      await fetchAttachments();
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      });

      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('arivia-photos')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('arivia-photos')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("task_attachments")
        .delete()
        .eq("id", attachment.id);

      if (dbError) throw dbError;

      await fetchAttachments();
      toast({
        title: "File deleted",
        description: "File has been removed successfully",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Attachments ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
          <div className="text-center space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Upload files</p>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to select files
              </p>
            </div>
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
            {isUploading && (
              <p className="text-xs text-muted-foreground">Uploading...</p>
            )}
          </div>
        </div>

        {/* Attachments List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-4">
              Loading attachments...
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No attachments yet. Upload some files to get started!
            </div>
          ) : (
            attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{attachment.file_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(attachment.file_size)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskAttachments;