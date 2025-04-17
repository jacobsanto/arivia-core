
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  title: string;
  description: string;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  description,
  isLoading,
  isSaving,
  isDirty,
  onSave,
  onReset,
  children,
  className,
  actions
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {isLoading ? (
        <Card className="w-full p-8 flex justify-center items-center">
          <LoadingSpinner size="large" />
        </Card>
      ) : (
        <div className="space-y-6">
          {children}
          
          <div className="flex justify-between items-center">
            {actions}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onReset}
                disabled={isSaving || !isDirty}
              >
                Reset
              </Button>
              <Button 
                onClick={onSave}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsLayout;
