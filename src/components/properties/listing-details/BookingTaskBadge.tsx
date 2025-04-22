
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Brush, Loader2, Check } from "lucide-react";

export function BookingTaskBadge({ status }: { status: string }) {
  let icon = <Brush className="h-4 w-4 mr-1" />;
  let text = "Cleaning";
  let color: any = "secondary";

  if (status === "pending") {
    icon = <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
    text = "Pending";
    color = "outline";
  } else if (status === "in-progress") {
    icon = <Brush className="h-4 w-4 mr-1" />;
    text = "In-Progress";
    color = "secondary";
  } else if (status === "done") {
    icon = <Check className="h-4 w-4 mr-1" />;
    text = "Done";
    color = "success";
  }

  return (
    <Badge variant={color} className="flex items-center px-2 py-1 rounded-full">
      {icon}
      <span>{text}</span>
    </Badge>
  );
}
