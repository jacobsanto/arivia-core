import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceTaskEnhanced, MaintenanceSort } from "@/types/maintenance-enhanced.types";
import { useMaintenanceEnhanced } from "@/hooks/useMaintenanceEnhanced";
import { TaskGridView } from "./enhanced/TaskGridView";
import { TaskListView } from "./enhanced/TaskListView";
import { TaskAgendaView } from "./enhanced/TaskAgendaView";
import TaskCalendarView from "./enhanced/TaskCalendarView";
import TaskDetailsModal from "./enhanced/TaskDetailsModal";
import { 
  Grid3X3, 
  List, 
  Clock3, 
  CalendarDays
} from "lucide-react";

interface MaintenanceViewModesProps {
  tasks?: MaintenanceTaskEnhanced[];
}

const MaintenanceViewModes = ({ tasks }: MaintenanceViewModesProps) => {
  const [selectedView, setSelectedView] = useState("grid");
  const [selectedTask, setSelectedTask] = useState<MaintenanceTaskEnhanced | null>(null);
  const [sort, setSort] = useState<MaintenanceSort>({ field: 'dueDate', direction: 'asc' });
  
  const {
    tasks: enhancedTasks
  } = useMaintenanceEnhanced();

  // Use provided tasks or enhanced tasks from hook
  const displayTasks = tasks || enhancedTasks;

  // Create mock grouped tasks for agenda view
  const mockGroups = [
    { key: 'today', title: 'Today', count: 2, tasks: displayTasks.slice(0, 2), isToday: true },
    { key: 'upcoming', title: 'Upcoming', count: 3, tasks: displayTasks.slice(2) }
  ];

  const handleTaskClick = (task: MaintenanceTaskEnhanced) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span className="hidden sm:inline">Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <TaskGridView 
            tasks={displayTasks} 
            onTaskClick={handleTaskClick}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <TaskListView 
            tasks={displayTasks}
            onTaskClick={handleTaskClick}
            sort={sort}
            onSortChange={setSort}
          />
        </TabsContent>

        <TabsContent value="agenda" className="mt-6">
          <TaskAgendaView 
            groups={mockGroups}
            onTaskClick={handleTaskClick}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <TaskCalendarView 
            tasks={displayTasks}
            onTaskClick={handleTaskClick}
          />
        </TabsContent>
      </Tabs>

      <TaskDetailsModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MaintenanceViewModes;