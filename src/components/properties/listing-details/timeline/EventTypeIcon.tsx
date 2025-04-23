
import React from "react";
import { Calendar, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "created" | "updated" | "cancelled";

interface EventTypeIconProps {
  event: EventType;
  className?: string;
}

export const EventTypeIcon: React.FC<EventTypeIconProps> = ({ event, className = "" }) => {
  switch (event) {
    case "created":
      return <Calendar className={cn("text-green-600", className)} size={18} />;
    case "updated":
      return <Package className={cn("text-blue-600", className)} size={18} />;
    case "cancelled":
      return <Calendar className={cn("text-red-600", className)} size={18} />;
    default:
      return null;
  }
};
