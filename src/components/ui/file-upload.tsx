
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onChange: (files: FileList) => void;
  value?: File[];
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean; // Add disabled prop
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onChange, value, accept, multiple = false, maxFiles = 10, maxSize = 5, className, disabled = false }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>(value || []);
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const selectedFiles = Array.from(e.target.files);
      
      // Check file count
      if (multiple && selectedFiles.length + files.length > maxFiles) {
        setError(`You can upload a maximum of ${maxFiles} files`);
        return;
      }
      
      // Check file size
      const oversizedFile = selectedFiles.find(
        file => file.size > maxSize * 1024 * 1024
      );
      
      if (oversizedFile) {
        setError(`File size should not exceed ${maxSize}MB`);
        return;
      }

      setError(null);
      
      const newFiles = multiple 
        ? [...files, ...selectedFiles].slice(0, maxFiles)
        : selectedFiles;
      
      setFiles(newFiles);
      onChange(e.target.files);
    };

    const removeFile = (index: number) => {
      if (disabled) return;
      
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      
      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => {
        dataTransfer.items.add(file);
      });
      
      onChange(dataTransfer.files);
    };

    return (
      <div className={cn("space-y-2", className)}>
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition",
            disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {multiple 
                ? `Click to upload files (max ${maxFiles})`
                : "Click to upload a file"}
            </p>
          </div>
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
        
        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2 md:grid-cols-3 lg:grid-cols-4">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="relative bg-muted rounded-md p-2 text-xs flex items-center overflow-hidden"
              >
                <div className="truncate flex-1">
                  {file.name}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className={cn(
                    "ml-1 text-muted-foreground hover:text-destructive",
                    disabled && "pointer-events-none"
                  )}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
