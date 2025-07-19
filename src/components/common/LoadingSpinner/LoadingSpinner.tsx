import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        white: "text-white",
        current: "text-current",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
  centered?: boolean;
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, centered = false, ...props }, ref) => {
    const spinner = <Loader2 className={cn(spinnerVariants({ size, variant }))} />;

    if (text) {
      return (
        <div
          className={cn(
            "flex items-center gap-2",
            centered && "justify-center",
            className
          )}
          ref={ref}
          {...props}
        >
          {spinner}
          <span className="text-sm text-muted-foreground">{text}</span>
        </div>
      );
    }

    if (centered) {
      return (
        <div
          className={cn("flex items-center justify-center", className)}
          ref={ref}
          {...props}
        >
          {spinner}
        </div>
      );
    }

    return (
      <div className={className} ref={ref} {...props}>
        {spinner}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Predefined loading states
export const PageLoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const ButtonLoadingSpinner = () => (
  <LoadingSpinner size="sm" variant="current" />
);

export const CardLoadingSpinner = ({ text }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);

export const FullPageLoadingSpinner = ({ text = "Loading application..." }: { text?: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="xl" />
      <p className="text-lg font-medium text-foreground">{text}</p>
    </div>
  </div>
);