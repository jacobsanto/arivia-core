
import React from 'react';
import { format, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AgendaHeaderProps {
  selectedDate: Date;
  onNavigateDay: (direction: 'next' | 'prev') => void;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  selectedDate,
  onNavigateDay
}) => {
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Get display text for the date
  const getDateDisplayText = () => {
    if (isToday(selectedDate)) {
      return "Today";
    }
    
    const tomorrow = addDays(new Date(), 1);
    if (selectedDate.getDate() === tomorrow.getDate() &&
        selectedDate.getMonth() === tomorrow.getMonth() &&
        selectedDate.getFullYear() === tomorrow.getFullYear()) {
      return "Tomorrow";
    }
    
    const yesterday = addDays(new Date(), -1);
    if (selectedDate.getDate() === yesterday.getDate() &&
        selectedDate.getMonth() === yesterday.getMonth() &&
        selectedDate.getFullYear() === yesterday.getFullYear()) {
      return "Yesterday";
    }
    
    return format(selectedDate, "EEEE");
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigateDay('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="text-center">
        <h3 className="text-lg font-medium">{getDateDisplayText()}</h3>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, "MMMM d, yyyy")}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigateDay('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AgendaHeader;
