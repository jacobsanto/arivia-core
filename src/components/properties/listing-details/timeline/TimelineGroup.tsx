
import React from "react";
import { isToday, isYesterday, format } from "date-fns";
import { TimelineEntry } from "./TimelineEntry";
import { BookingActivityEntry } from "../types/bookingActivityTypes";

interface TimelineGroupProps {
  date: string;
  entries: BookingActivityEntry[];
  expanded: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  date,
  entries,
  expanded,
  onToggleExpand,
}) => {
  const formattedDate = isToday(new Date(date))
    ? "Today"
    : isYesterday(new Date(date))
    ? "Yesterday"
    : format(new Date(date), "d MMM yyyy");

  return (
    <div className="mb-6">
      <div className="text-xs font-medium text-muted-foreground mb-2 pl-2">
        {formattedDate}
      </div>
      <div className="space-y-2">
        {entries.map(entry => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            isExpanded={expanded[entry.id] || false}
            onToggleExpand={() => onToggleExpand(entry.id)}
          />
        ))}
      </div>
    </div>
  );
};
