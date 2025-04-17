
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SettingsStatus = "configured" | "not-configured" | "needs-attention";

interface SettingsStatusBadgeProps {
  status: SettingsStatus;
  lastUpdated?: Date;
}

const SettingsStatusBadge: React.FC<SettingsStatusBadgeProps> = ({ 
  status, 
  lastUpdated 
}) => {
  const getStatusDetails = () => {
    switch (status) {
      case "configured":
        return {
          label: "Configured",
          variant: "outline" as const,
          icon: <CheckCircle className="h-4 w-4 text-green-500 mr-1" />,
          className: "border-green-200 text-green-700 bg-green-50"
        };
      case "not-configured":
        return {
          label: "Not Configured",
          variant: "outline" as const,
          icon: <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />,
          className: "border-amber-200 text-amber-700 bg-amber-50"
        };
      case "needs-attention":
        return {
          label: "Needs Attention",
          variant: "outline" as const,
          icon: <AlertCircle className="h-4 w-4 text-red-500 mr-1" />,
          className: "border-red-200 text-red-700 bg-red-50"
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: null,
          className: ""
        };
    }
  };

  const { label, variant, icon, className } = getStatusDetails();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={className}>
            {icon}
            <span>{label}</span>
            {lastUpdated && status === "configured" && (
              <Clock className="ml-1 h-3 w-3 opacity-70" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {lastUpdated 
            ? `Last updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}` 
            : status === "not-configured" 
              ? "These settings haven't been configured yet" 
              : "Settings status"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SettingsStatusBadge;
