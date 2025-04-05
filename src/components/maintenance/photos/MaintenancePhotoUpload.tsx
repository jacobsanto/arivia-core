
import React from "react";
import { Plus } from "lucide-react";

interface MaintenancePhotoUploadProps {
  type: 'before' | 'after';
  onPhotoUpload?: (file: File, type: 'before' | 'after') => void;
  disabled?: boolean;
}

const MaintenancePhotoUpload = ({
  type,
  onPhotoUpload,
  disabled = false
}: MaintenancePhotoUploadProps) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onPhotoUpload) {
      onPhotoUpload(e.target.files[0], type);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <label className="bg-secondary rounded flex items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handlePhotoUpload}
            disabled={disabled}
          />
          <Plus className="h-6 w-6 text-muted-foreground" />
        </label>
        <div className="bg-secondary rounded flex items-center justify-center h-24">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="bg-secondary rounded flex items-center justify-center h-24">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default MaintenancePhotoUpload;
