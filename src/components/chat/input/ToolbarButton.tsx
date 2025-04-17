
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 rounded-full",
        active && "bg-primary/10",
        "hover:bg-muted"
      )}
      onClick={onClick}
      title={label}
      disabled={disabled}
    >
      {icon}
    </Button>
  );
};

export default ToolbarButton;
