
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface FileAttachment {
  id: string;
  file: File;
  type: string;
  name: string;
}

export interface UploadedAttachment {
  id: string;
  type: string;
  url: string;
  name: string;
}

export async function uploadAttachments(
  attachments: FileAttachment[],
  basePath: string
): Promise<UploadedAttachment[]> {
  if (!attachments || attachments.length === 0) {
    return [];
  }
  
  const uploadedAttachments: UploadedAttachment[] = [];
  
  // Process each file and upload
  for (const attachment of attachments) {
    try {
      // Generate a unique file path
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${basePath}${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chat-attachments')
        .upload(filePath, attachment.file);
        
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        continue;
      }
      
      // Generate a signed URL for immediate access (not stored)
      const { data: signed } = await supabase
        .storage
        .from('chat-attachments')
        .createSignedUrl(filePath, 60 * 60); // 1 hour
      
      // Store the storage path (not public URL)
      uploadedAttachments.push({
        id: attachment.id,
        type: attachment.type,
        url: filePath, // store path; renderer will sign when displaying
        name: attachment.name
      });
    } catch (error) {
      console.error("Error processing attachment:", error);
    }
  }
  
  return uploadedAttachments;
}
