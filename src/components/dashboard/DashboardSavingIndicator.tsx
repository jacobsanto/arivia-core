
import React, { memo } from "react";
import { Save } from "lucide-react";

const DashboardSavingIndicator = memo(({ isSaving, lastSaved }: { 
  isSaving: boolean;
  lastSaved: Date | null;
}) => {
  if (isSaving) {
    return (
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <Save className="h-3 w-3 mr-1 animate-pulse" />
        <span>Saving preferences...</span>
      </div>
    );
  }
  
  if (lastSaved) {
    return (
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <span>Preferences saved at {lastSaved.toLocaleTimeString()}</span>
      </div>
    );
  }
  
  return null;
});
DashboardSavingIndicator.displayName = 'DashboardSavingIndicator';

export default DashboardSavingIndicator;
