
import React from "react";
import { Plus } from "lucide-react";

interface TaskPhotosProps {
  photos: string[] | undefined;
  onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const TaskPhotos = ({ photos = [], onPhotoUpload, disabled }: TaskPhotosProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Photo Verification</h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="bg-secondary rounded h-24 flex items-center justify-center overflow-hidden">
            <img src={photo} alt={`Verification ${index + 1}`} className="object-cover w-full h-full" />
          </div>
        ))}
        {photos.length < 3 && !disabled && (
          <label className="bg-secondary rounded flex items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onPhotoUpload}
            />
            <Plus className="h-6 w-6 text-muted-foreground" />
          </label>
        )}
        {Array.from({ length: Math.max(0, 2 - photos.length) }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-secondary rounded flex items-center justify-center h-24">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPhotos;
