
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventTypeIcon } from "./EventTypeIcon";
import { OriginIcon } from "./OriginIcon";
import { BookingActivityEntry } from "../types/bookingActivityTypes";

interface TimelineEntryProps {
  entry: BookingActivityEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  entry,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <Card
      className={cn(
        "w-full transition-shadow duration-200 cursor-pointer border",
        isExpanded && "shadow-lg bg-muted/50"
      )}
      onClick={onToggleExpand}
    >
      <CardContent className="py-3 px-4 flex flex-col">
        <div className="flex items-center gap-2">
          <EventTypeIcon event={entry.event_type} />
          <Badge
            variant={
              entry.event_type === "created"
                ? "default"
                : entry.event_type === "updated"
                ? "secondary"
                : "destructive"
            }
            className="text-xs"
          >
            {entry.event_type.charAt(0).toUpperCase() + entry.event_type.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground ml-2">
            {format(new Date(entry.synced_at), "HH:mm")}
          </span>
          <span className="flex items-center gap-1 ml-auto mr-2">
            <OriginIcon origin={entry.origin} />
            <span className="text-xs text-muted-foreground">
              {entry.origin === "webhook" ? "Webhook" : "API Sync"}
            </span>
          </span>
        </div>
        <div className="mt-1 flex flex-col md:flex-row md:items-center md:gap-3">
          <span className="text-sm font-medium">
            Booking ID: <span className="font-mono">{entry.booking_id}</span>
          </span>
          {entry.guest_name && (
            <span className="text-xs text-muted-foreground ml-0 md:ml-1">
              • Guest: {entry.guest_name}
            </span>
          )}
        </div>
        <div className="mt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={e => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="px-2 h-7 text-xs"
          >
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>
        </div>
        {isExpanded && (
          <div className="bg-muted rounded p-2 mt-2 text-xs font-mono break-words whitespace-pre-line select-text">
            {entry.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
