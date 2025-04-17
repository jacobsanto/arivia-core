
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

const EncryptionKeySettings: React.FC = () => {
  const generateEncryptionKeys = () => {
    toast.info("Generating new encryption keys...");
    
    // In a real application, this would involve server-side key generation
    setTimeout(() => {
      toast.success("New encryption keys generated", {
        description: "Application encryption keys have been rotated."
      });
    }, 1500);
  };

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium mb-2">Encryption Key Management</h3>
      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={generateEncryptionKeys}
      >
        <RefreshCw className="h-4 w-4" />
        <LockKeyhole className="h-4 w-4" />
        Rotate Encryption Keys
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        Warning: Rotating encryption keys will require re-encryption of sensitive data
      </p>
    </div>
  );
};

export default EncryptionKeySettings;
