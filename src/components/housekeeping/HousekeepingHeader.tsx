
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, Filter, Plus } from "lucide-react";

const HousekeepingHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Housekeeping Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track housekeeping tasks across all properties
        </p>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          <span>Calendar View</span>
        </Button>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </Button>
      </div>
    </div>
  );
};

export default HousekeepingHeader;
