
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, X } from "lucide-react";
import { GuestyStatusBadgeProps } from "./types";

const GuestyStatusBadge: React.FC<GuestyStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'connected':
      return (
        <Badge variant="success" className="gap-1">
          <Check className="h-3.5 w-3.5" />
          Connected
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <X className="h-3.5 w-3.5" />
          Disconnected
        </Badge>
      );
  }
};

export default GuestyStatusBadge;
