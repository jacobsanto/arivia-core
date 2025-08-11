import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionProps = React.ComponentProps<"section"> & {
  container?: boolean;
};

/**
 * Section
 * Semantic section with consistent responsive paddings and spacing.
 */
export function Section({ className, children, container = true, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        // vertical padding scales with viewport
        "py-6 sm:py-8 lg:py-10",
        // horizontal padding + max width container
        container && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      <div className={cn(container && "mx-auto w-full max-w-7xl")}>{children}</div>
    </section>
  );
}

export default Section;
