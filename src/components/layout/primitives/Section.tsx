import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerSlot?: React.ReactNode;
}

/**
 * Section
 * Semantic section wrapper with responsive paddings and cohesive spacing.
 * Uses design tokens and keeps consistent vertical rhythm across the app.
 */
export function Section({ id, title, description, children, className, headerSlot }: SectionProps) {
  return (
    <section id={id} className={cn("w-full px-3 py-4 md:px-6 md:py-6", className)}>
      {(title || description || headerSlot) && (
        <header className="mb-3 md:mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              {title && (
                <h2 className="section-heading text-foreground">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {headerSlot}
          </div>
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}

export default Section;
