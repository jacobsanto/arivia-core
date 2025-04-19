
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Attachment {
  id: string;
  file: File;
  type: string;
  preview: string;
}

export function useAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileSelect = (files: FileList) => {
    const newAttachments = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleImageSelect = (files: FileList) => {
    const newAttachments = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const clearAttachments = () => {
    attachments.forEach(attachment => {
      URL.revokeObjectURL(attachment.preview);
    });
    setAttachments([]);
  };

  return {
    attachments,
    fileInputRef,
    imageInputRef,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    clearAttachments
  };
}
