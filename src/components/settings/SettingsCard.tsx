
import React, { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onReset?: () => void;
  showFooter?: boolean;
  footer?: ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  isLoading = false,
  isSaving = false,
  onSave,
  onReset,
  showFooter = true,
  footer,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      {isLoading ? (
        <CardContent className="pt-6 flex justify-center">
          <LoadingSpinner />
        </CardContent>
      ) : (
        <CardContent className="space-y-6">{children}</CardContent>
      )}
      
      {showFooter && (footer || onSave || onReset) && (
        <CardFooter className="flex justify-between">
          {footer ? (
            footer
          ) : (
            <>
              {onReset && (
                <Button variant="outline" type="button" onClick={onReset}>
                  Reset
                </Button>
              )}
              {onSave && (
                <Button type="button" onClick={onSave} disabled={isSaving}>
                  {isSaving ? <LoadingSpinner size="small" className="mr-2" /> : null}
                  Save Changes
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default SettingsCard;
