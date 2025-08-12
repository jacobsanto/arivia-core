import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader
 * Standard page header with a single H1, description and optional actions.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("w-full px-3 md:px-6 mb-4 md:mb-6", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-heading text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 max-w-prose">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
