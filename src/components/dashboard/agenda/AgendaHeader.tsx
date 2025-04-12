
import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarClock, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from 'date-fns';
import { CardTitle } from "@/components/ui/card";

interface AgendaHeaderProps {
  selectedDate: Date;
  onNavigateDay: (direction: 'next' | 'prev') => void;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({ 
  selectedDate, 
  onNavigateDay 
}) => {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-base md:text-lg flex items-center gap-2">
        <CalendarClock className="h-5 w-5" />
        Daily Agenda
      </CardTitle>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onNavigateDay('prev')}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Day</span>
        </Button>
        <div className="font-medium text-sm">
          {format(selectedDate, 'EEEE, MMM d')}
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onNavigateDay('next')}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Day</span>
        </Button>
      </div>
    </div>
  );
};

export default AgendaHeader;
