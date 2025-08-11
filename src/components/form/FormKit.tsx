import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface FormFieldWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

export function FormFieldWrapper({ label, description, error, required, className, children, ...props }: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label ? (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required ? <span aria-hidden className="text-destructive ml-0.5">*</span> : null}
        </label>
      ) : null}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      <div>{children}</div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface FormErrorSummaryProps {
  errors?: unknown;
  messages?: string[];
  title?: string;
}

function extractMessages(errors: unknown): string[] {
  if (!errors) return [];
  const msgs: string[] = [];
  const walk = (obj: any) => {
    if (!obj) return;
    if (typeof obj === "string") msgs.push(obj);
    if (Array.isArray(obj)) obj.forEach(walk);
    else if (typeof obj === "object") Object.values(obj).forEach(walk);
  };
  walk(errors as any);
  return msgs.filter(Boolean).slice(0, 8);
}

export function FormErrorSummary({ errors, messages, title = "Please fix the following:" }: FormErrorSummaryProps) {
  const list = messages ?? extractMessages(errors);
  if (!list.length) return null;
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
      <p className="text-sm font-medium text-destructive mb-2">{title}</p>
      <ul className="list-disc pl-5 space-y-1 text-sm text-destructive">
        {list.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export interface SubmitButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function SubmitButton({ isLoading, loadingText = "Saving...", children, disabled, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" aria-busy={isLoading} disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" aria-hidden />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

// Mobile input helpers
export type MobileInputHints = {
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
};

export const mobileHints = {
  email: { autoComplete: "email", inputMode: "email", enterKeyHint: "next" } as MobileInputHints,
  phone: { autoComplete: "tel", inputMode: "tel", enterKeyHint: "next" } as MobileInputHints,
  name: { autoComplete: "name", inputMode: "text", enterKeyHint: "next" } as MobileInputHints,
  number: { inputMode: "numeric", enterKeyHint: "done" } as MobileInputHints,
};
