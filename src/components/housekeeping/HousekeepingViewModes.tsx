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
  BedDouble,
  CheckCircle,
  Play,
  Pause,
  Sparkles
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format, isToday, isTomorrow, addDays } from "date-fns";

// Mock housekeeping tasks data
const mockTasks = [
  {
    id: "H001",
    title: "Turnover Cleaning - Ocean Suite",
    description: "Complete turnover cleaning after guest checkout",
    property: "Ocean View Villa",
    room: "Suite 101",
    taskType: "turnover",
    assignedTo: "Maria Garcia",
    priority: "high",
    status: "pending",
    dueDate: new Date(),
    estimatedDuration: 3,
    checklistItems: 15,
    completedItems: 0,
    dependencies: ["H002"],
    guestCheckOut: "11:00 AM",
    nextCheckIn: "3:00 PM"
  },
  {
    id: "H002", 
    title: "Guest Checkout Inspection",
    description: "Post-checkout damage and inventory inspection",
    property: "Ocean View Villa",
    room: "Suite 101",
    taskType: "inspection",
    assignedTo: "Sarah Wilson",
    priority: "high",
    status: "completed",
    dueDate: new Date(),
    estimatedDuration: 1,
    checklistItems: 8,
    completedItems: 8,
    dependencies: []
  },
  {
    id: "H003",
    title: "Mid-Stay Refresh",
    description: "Daily cleaning for extended stay guest",
    property: "Beach House",
    room: "Villa 205",
    taskType: "mid_stay",
    assignedTo: "John Smith",
    priority: "medium",
    status: "in_progress",
    dueDate: addDays(new Date(), 1),
    estimatedDuration: 2,
    checklistItems: 10,
    completedItems: 6,
    dependencies: []
  },
  {
    id: "H004",
    title: "Deep Clean - Garden Villa",
    description: "Weekly deep cleaning maintenance",
    property: "Garden Villa",
    room: "Entire Villa",
    taskType: "deep_clean",
    assignedTo: "Mike Johnson",
    priority: "low",
    status: "pending",
    dueDate: addDays(new Date(), 2),
    estimatedDuration: 5,
    checklistItems: 25,
    completedItems: 0,
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
    case "blocked": return Pause;
    default: return Clock;
  }
};

const getTaskTypeIcon = (taskType: string) => {
  switch (taskType) {
    case "turnover": return BedDouble;
    case "inspection": return CheckCircle;
    case "mid_stay": return Sparkles;
    case "deep_clean": return Sparkles;
    default: return BedDouble;
  }
};

interface HousekeepingViewModesProps {
  tasks?: typeof mockTasks;
}

const HousekeepingViewModes: React.FC<HousekeepingViewModesProps> = ({ 
  tasks = mockTasks 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = useState("grid");

  // Task Card Component
  const TaskCard = ({ task }: { task: typeof mockTasks[0] }) => {
    const StatusIcon = getStatusIcon(task.status);
    const TaskTypeIcon = getTaskTypeIcon(task.taskType);
    const progressPercentage = Math.round((task.completedItems / task.checklistItems) * 100);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TaskTypeIcon className="h-4 w-4 text-muted-foreground" />
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
                  <Pause className="h-4 w-4 mr-2" />
                  Block Task
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
            <Badge variant="outline">
              {task.taskType.replace('_', ' ')}
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
              <span className="text-muted-foreground">Room:</span>
              <span className="font-medium">{task.room}</span>
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
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">{task.completedItems}/{task.checklistItems} items</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Guest timing info for turnovers */}
          {task.taskType === "turnover" && (
            <div className="text-xs space-y-1 p-2 bg-muted/50 rounded">
              {task.guestCheckOut && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checkout:</span>
                  <span>{task.guestCheckOut}</span>
                </div>
              )}
              {task.nextCheckIn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Check-in:</span>
                  <span>{task.nextCheckIn}</span>
                </div>
              )}
            </div>
          )}
          
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
              <CardTitle>Housekeeping Tasks List</CardTitle>
              <CardDescription>
                All housekeeping tasks with their progress and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const StatusIcon = getStatusIcon(task.status);
                  const TaskTypeIcon = getTaskTypeIcon(task.taskType);
                  const progressPercentage = Math.round((task.completedItems / task.checklistItems) * 100);
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4 flex-1">
                        <TaskTypeIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{task.property}</span>
                            <span>•</span>
                            <span>{task.room}</span>
                            <span>•</span>
                            <span>{task.assignedTo}</span>
                          </div>
                          <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${progressPercentage}%` }}
                            />
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
                          <div className="text-muted-foreground">
                            {task.completedItems}/{task.checklistItems} • {task.estimatedDuration}h
                          </div>
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
                      <p className="text-xs text-muted-foreground">{task.assignedTo} • {task.room}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.completedItems}/{task.checklistItems}
                        </span>
                      </div>
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
                      <p className="text-xs text-muted-foreground">{task.assignedTo} • {task.room}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.completedItems}/{task.checklistItems}
                        </span>
                      </div>
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
                        {task.assignedTo} • {task.room} • {format(task.dueDate, "MMM dd")}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.completedItems}/{task.checklistItems}
                        </span>
                      </div>
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
                    .map(task => {
                      const progressPercentage = Math.round((task.completedItems / task.checklistItems) * 100);
                      
                      return (
                        <div key={task.id} className="p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {task.property} • {task.room} • {task.assignedTo}
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
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {task.completedItems}/{task.checklistItems} • {task.estimatedDuration}h
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  
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

export default HousekeepingViewModes;
