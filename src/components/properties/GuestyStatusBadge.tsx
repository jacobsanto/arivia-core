
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface GuestyStatusBadgeProps {
  status: string | undefined;
  lastSynced?: string | null;
}

export const GuestyStatusBadge = ({ status, lastSynced }: GuestyStatusBadgeProps) => {
  if (status === 'connected') {
    return (
      <Badge variant="success" className="gap-1">
        <Check className="h-3.5 w-3.5" />
        Connected to Guesty
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <X className="h-3.5 w-3.5" />
      Disconnected
      {lastSynced && (
        <span className="ml-1 text-xs">
          (Last sync: {new Date(lastSynced).toLocaleDateString()})
        </span>
      )}
    </Badge>
  );
};
