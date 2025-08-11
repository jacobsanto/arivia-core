import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.ComponentProps<"header"> {
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * PageHeader
 * Consistent header with title, subtitle and actions, mobile-first.
 */
export function PageHeader({ heading, subtitle, actions, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn("mb-4 sm:mb-6 lg:mb-8", className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground animate-fade-in">
            {heading}
          </h1>
          {subtitle ? (
            <p className="text-sm sm:text-base text-muted-foreground animate-fade-in">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;
