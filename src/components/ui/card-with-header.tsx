
import React, { ReactNode } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardWithHeaderProps {
  title: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
  noBodyPadding?: boolean;
  rightHeaderContent?: ReactNode;
  subtitle?: string;
}

export const CardWithHeader = ({
  title,
  description,
  className,
  contentClassName,
  headerClassName,
  children,
  footer,
  noBodyPadding = false,
  rightHeaderContent,
  subtitle,
}: CardWithHeaderProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("flex flex-row items-start justify-between gap-2", headerClassName)}>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <div className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</div>}
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {rightHeaderContent && (
          <div>{rightHeaderContent}</div>
        )}
      </CardHeader>
      
      <CardContent className={cn({ "p-0": noBodyPadding }, contentClassName)}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="border-t bg-muted/50 p-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};
