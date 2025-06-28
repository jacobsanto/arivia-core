
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("space-y-6 w-full max-w-full", className)}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
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
        <div className="space-y-6 w-full">
          <ScrollArea className="w-full max-w-full" orientation="both">
            {children}
          </ScrollArea>
          
          <div className={cn("flex gap-2", isMobile ? "flex-col-reverse" : "justify-between items-center")}>
            {actions && (
              <div className={cn("flex", isMobile ? "justify-center mb-2" : "")}>
                {actions}
              </div>
            )}
            <div className={cn("flex gap-2", isMobile ? "justify-center" : "")}>
              <Button 
                variant="outline" 
                onClick={onReset}
                disabled={isSaving || !isDirty}
                className={isMobile ? "flex-1" : ""}
              >
                Reset
              </Button>
              <Button 
                onClick={onSave}
                disabled={isSaving || !isDirty}
                className={isMobile ? "flex-1" : ""}
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
