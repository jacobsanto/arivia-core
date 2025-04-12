
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  saveDisabled?: boolean;
  resetDisabled?: boolean;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  footer,
  onSave,
  onReset,
  saveDisabled = false,
  resetDisabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-between">
        {footer ? (
          footer
        ) : (
          <>
            {onReset && (
              <Button variant="outline" type="button" disabled={resetDisabled} onClick={onReset}>
                Reset
              </Button>
            )}
            {onSave && (
              <Button type="submit" disabled={saveDisabled} onClick={onSave}>
                Save Changes
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SettingsCard;
