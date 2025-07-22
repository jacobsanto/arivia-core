import { useState, useRef } from 'react';

export interface Attachment {
  id: string;
  type: string;
  name: string;
  size: number;
  url: string;
  file: File;
  preview?: string;
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        type: file.type,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        id: `image-${Date.now()}-${Math.random()}`,
        type: file.type,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment && attachment.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  const clearAttachments = () => {
    attachments.forEach(attachment => {
      if (attachment.url) {
        URL.revokeObjectURL(attachment.url);
      }
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
