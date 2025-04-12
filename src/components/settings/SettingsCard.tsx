
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  saveDisabled?: boolean;
  resetDisabled?: boolean;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "premium";
  };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  footer,
  onSave,
  onReset,
  saveDisabled = false,
  resetDisabled = false,
  badge,
  collapsible = false,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Map badge variant to tailwind classes
  const getBadgeClass = (variant: string = "default") => {
    switch (variant) {
      case "premium":
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("transition-all duration-200", className, 
      isCollapsed ? "max-h-24 overflow-hidden" : "")}>
      <CardHeader 
        className={cn(
          "flex flex-row items-center justify-between",
          collapsible && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={toggleCollapse}
      >
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge && (
              <Badge className={getBadgeClass(badge.variant)}>
                {badge.text}
              </Badge>
            )}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {collapsible && (
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}>
            {isCollapsed ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronUp className="h-4 w-4" />
            }
          </Button>
        )}
      </CardHeader>
      <CardContent className={cn(
        isCollapsed ? "hidden" : "",
        "transition-all duration-300"
      )}>
        {children}
      </CardContent>
      {!isCollapsed && (
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
      )}
    </Card>
  );
};

export default SettingsCard;
