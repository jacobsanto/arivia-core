import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Repeat, Calendar, Clock, Plus, MoreVertical, Play, Pause, Edit, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Mock data for recurring tasks
const recurringTasks = [
  {
    id: "1",
    name: "Weekly Pool Maintenance",
    description: "Complete pool cleaning and chemical balance check",
    schedule: "Weekly - Mondays",
    lastRun: "2024-12-30",
    nextRun: "2025-01-06",
    status: "active",
    assignedTo: "John Doe",
    duration: "2 hours",
    priority: "medium"
  },
  {
    id: "2", 
    name: "Monthly HVAC Inspection",
    description: "Inspect and service all HVAC units across properties",
    schedule: "Monthly - 1st",
    lastRun: "2024-12-01",
    nextRun: "2025-01-01",
    status: "active",
    assignedTo: "Sarah Wilson",
    duration: "4 hours", 
    priority: "high"
  },
  {
    id: "3",
    name: "Daily Lobby Cleaning",
    description: "Clean and sanitize main lobby areas",
    schedule: "Daily - 8:00 AM",
    lastRun: "2024-12-31",
    nextRun: "2025-01-01",
    status: "paused",
    assignedTo: "Maria Garcia",
    duration: "30 minutes",
    priority: "low"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-success text-success-foreground";
    case "paused": return "bg-warning text-warning-foreground";
    case "inactive": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "border-destructive text-destructive";
    case "medium": return "border-warning text-warning";
    case "low": return "border-muted text-muted-foreground";
    default: return "border-muted text-muted-foreground";
  }
};

const RecurringTasks: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <>
      <Helmet>
        <title>Recurring Tasks - Arivia Villas</title>
        <meta name="description" content="Manage automated recurring tasks and schedules for property operations" />
      </Helmet>

      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Repeat className="h-8 w-8 text-primary" />
              Recurring Tasks
            </h1>
            <p className="text-muted-foreground">Automate routine operations with scheduled recurring tasks</p>
          </div>
          
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Recurring Task
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
                <Repeat className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-success">8</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <Play className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-warning">3</p>
                  <p className="text-sm text-muted-foreground">Paused</p>
                </div>
                <Pause className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">24</p>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring Task Schedule</CardTitle>
            <CardDescription>
              Manage your automated recurring tasks and their schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
                <TabsTrigger value="upcoming">Due Today</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {recurringTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-foreground">{task.name}</h3>
                          <Badge className={getStatusColor(task.status)} variant="secondary">
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Schedule:</span>
                            <p className="font-medium">{task.schedule}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Assigned to:</span>
                            <p className="font-medium">{task.assignedTo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-medium">{task.duration}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Run:</span>
                            <p className="font-medium">{task.nextRun}</p>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {task.status === "active" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Task
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate Task
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="active">
                <div className="text-center py-8 text-muted-foreground">
                  Active tasks will be displayed here
                </div>
              </TabsContent>

              <TabsContent value="paused">
                <div className="text-center py-8 text-muted-foreground">
                  Paused tasks will be displayed here
                </div>
              </TabsContent>

              <TabsContent value="upcoming">
                <div className="text-center py-8 text-muted-foreground">
                  Tasks due today will be displayed here
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RecurringTasks;