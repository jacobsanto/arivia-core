
import React, { useState } from "react";
import { Plus, Image, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MaintenanceMediaUploadProps {
  type: 'before' | 'after';
  onPhotoUpload?: (file: File, type: 'before' | 'after') => void;
  onVideoUpload?: (file: File, type: 'before' | 'after') => void;
  disabled?: boolean;
  photos?: string[];
  videos?: string[];
}

const MaintenanceMediaUpload = ({
  type,
  onPhotoUpload,
  onVideoUpload,
  disabled = false,
  photos = [],
  videos = []
}: MaintenanceMediaUploadProps) => {
  const [activeTab, setActiveTab] = useState<string>("photos");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onPhotoUpload) {
      onPhotoUpload(e.target.files[0], type);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onVideoUpload) {
      onVideoUpload(e.target.files[0], type);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="photos" className="flex items-center gap-1">
            <Image className="w-4 h-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <div className="grid grid-cols-3 gap-2 mt-2">
            <label className="bg-secondary rounded flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
                disabled={disabled}
              />
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
            </label>
            {photos.map((photo, index) => (
              <div key={index} className="bg-secondary rounded h-24 relative">
                <img src={photo} alt="Maintenance" className="h-full w-full object-cover rounded" />
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-1 right-1 h-5 w-5"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-3 gap-2 mt-2">
            <label className="bg-secondary rounded flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={handleVideoUpload}
                disabled={disabled}
              />
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add Video</span>
            </label>
            {videos.map((video, index) => (
              <div key={index} className="bg-secondary rounded h-24 relative">
                <video className="h-full w-full object-cover rounded">
                  <source src={video} />
                  Your browser does not support the video tag.
                </video>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-1 right-1 h-5 w-5"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceMediaUpload;
