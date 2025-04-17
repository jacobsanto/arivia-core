
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showSeparator?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  className,
  showSeparator = false
}) => {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {children}
        {showSeparator && <Separator className="my-4" />}
      </CardContent>
    </Card>
  );
};

export default SettingsSection;
