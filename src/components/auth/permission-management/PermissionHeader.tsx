
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Save } from "lucide-react";

interface PermissionHeaderProps {
  selectedUser: any;
  isSaving: boolean;
  onSave: () => void;
  onResetToDefault: () => void;
}

const PermissionHeader: React.FC<PermissionHeaderProps> = ({
  selectedUser,
  isSaving,
  onSave,
  onResetToDefault
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h4 className="text-sm font-semibold">Current Role: {selectedUser.role}</h4>
        <p className="text-xs text-muted-foreground">Customized permissions will override role-based permissions</p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResetToDefault}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Default
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1"
          size="sm"
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PermissionHeader;
