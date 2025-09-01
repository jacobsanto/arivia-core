import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Grid3X3, 
  List, 
  Calendar as CalendarIcon, 
  Clock,
  MoreVertical,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Play
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format, isToday, isTomorrow, addDays } from "date-fns";

// Mock maintenance tasks data
const mockTasks = [
  {
    id: "M001",
    title: "HVAC System Maintenance",
    description: "Annual HVAC system inspection and cleaning",
    property: "Ocean View Villa",
    location: "Roof Unit A",
    assignedTo: "John Smith",
    priority: "high",
    status: "pending",
    dueDate: new Date(),
    estimatedDuration: 4,
    dependencies: []
  },
  {
    id: "M002", 
    title: "Pool Equipment Check",
    description: "Weekly pool pump and filter maintenance",
    property: "Beach House",
    location: "Pool Area",
    assignedTo: "Mike Johnson",
    priority: "medium",
    status: "in_progress",
    dueDate: addDays(new Date(), 1),
    estimatedDuration: 2,
    dependencies: ["M003"]
  },
  {
    id: "M003",
    title: "Water Quality Testing",
    description: "Test and balance pool water chemistry",
    property: "Beach House", 
    location: "Pool",
    assignedTo: "Mike Johnson",
    priority: "medium",
    status: "completed",
    dueDate: new Date(),
    estimatedDuration: 1,
    dependencies: []
  },
  {
    id: "M004",
    title: "Garden Irrigation Repair",
    description: "Fix broken sprinkler heads in garden area",
    property: "Garden Villa",
    location: "Front Garden",
    assignedTo: "Sarah Wilson",
    priority: "low",
    status: "pending",
    dueDate: addDays(new Date(), 2),
    estimatedDuration: 3,
    dependencies: []
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "border-destructive text-destructive";
    case "medium": return "border-warning text-warning";
    case "low": return "border-muted text-muted-foreground";
    default: return "border-muted text-muted-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-muted text-muted-foreground";
    case "in_progress": return "bg-warning text-warning-foreground";
    case "completed": return "bg-success text-success-foreground";
    case "blocked": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending": return Clock;
    case "in_progress": return Play;
    case "completed": return CheckCircle;
    case "blocked": return AlertTriangle;
    default: return Clock;
  }
};

interface MaintenanceViewModesProps {
  tasks?: typeof mockTasks;
}

const MaintenanceViewModes: React.FC<MaintenanceViewModesProps> = ({ 
  tasks = mockTasks 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = useState("grid");

  // Task Card Component
  const TaskCard = ({ task }: { task: typeof mockTasks[0] }) => {
    const StatusIcon = getStatusIcon(task.status);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{task.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">{task.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Play className="h-4 w-4 mr-2" />
                  Start Task
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span className="font-medium">{task.property}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{task.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium">{task.assignedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">
                {isToday(task.dueDate) ? "Today" : 
                 isTomorrow(task.dueDate) ? "Tomorrow" : 
                 format(task.dueDate, "MMM dd")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{task.estimatedDuration}h</span>
            </div>
          </div>
          
          {task.dependencies.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Depends on:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.dependencies.map((dep) => (
                  <Badge key={dep} variant="outline" className="text-xs">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Grid
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tasks List</CardTitle>
              <CardDescription>
                All maintenance tasks with their details and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const StatusIcon = getStatusIcon(task.status);
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{task.property}</span>
                            <span>•</span>
                            <span>{task.location}</span>
                            <span>•</span>
                            <span>{task.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {isToday(task.dueDate) ? "Today" : 
                             isTomorrow(task.dueDate) ? "Tomorrow" : 
                             format(task.dueDate, "MMM dd")}
                          </div>
                          <div className="text-muted-foreground">{task.estimatedDuration}h</div>
                        </div>
                        
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        
                        <Badge className={getStatusColor(task.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              Start Task
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda View */}
        <TabsContent value="agenda">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks
                  .filter(task => isToday(task.dueDate))
                  .map(task => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tomorrow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks
                  .filter(task => isTomorrow(task.dueDate))
                  .map(task => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks
                  .filter(task => !isToday(task.dueDate) && !isTomorrow(task.dueDate))
                  .map(task => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {task.assignedTo} • {format(task.dueDate, "MMM dd")}
                      </p>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Task Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Tasks for {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Selected Date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks
                    .filter(task => selectedDate && format(task.dueDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                    .map(task => (
                      <div key={task.id} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.property} • {task.assignedTo} • {task.estimatedDuration}h
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {selectedDate && tasks.filter(task => 
                    format(task.dueDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                  ).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No tasks scheduled for this date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceViewModes;