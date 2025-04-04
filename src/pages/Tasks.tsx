
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Plus } from "lucide-react";
import { toast } from "sonner";

// Sample task data
const tasks = [
  {
    id: 1,
    title: "Villa Caldera Cleaning",
    property: "Villa Caldera",
    type: "Housekeeping",
    status: "Pending",
    priority: "High",
    dueDate: "2025-04-04T14:00:00",
    assignee: "Maria Kowalska",
    description: "Complete full cleaning after guest checkout",
    checklist: [
      { id: 1, title: "Clean living room", completed: false },
      { id: 2, title: "Clean kitchen", completed: false },
      { id: 3, title: "Clean master bedroom", completed: false },
      { id: 4, title: "Clean guest bedrooms", completed: false },
      { id: 5, title: "Clean bathrooms", completed: false },
      { id: 6, title: "Clean outdoor areas", completed: false },
    ],
  },
  {
    id: 2,
    title: "Villa Azure AC Repair",
    property: "Villa Azure",
    type: "Maintenance",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2025-04-04T16:30:00",
    assignee: "Alex Chen",
    description: "Fix AC unit in master bedroom",
    checklist: [
      { id: 1, title: "Inspect AC unit", completed: true },
      { id: 2, title: "Replace filter", completed: true },
      { id: 3, title: "Clean condenser coils", completed: false },
      { id: 4, title: "Test cooling function", completed: false },
    ],
  },
  {
    id: 3,
    title: "Villa Sunset Inventory Restock",
    property: "Villa Sunset",
    type: "Inventory",
    status: "Pending",
    priority: "Medium",
    dueDate: "2025-04-05T10:00:00",
    assignee: "Stefan Müller",
    description: "Restock bathroom supplies and kitchen essentials",
    checklist: [
      { id: 1, title: "Restock bathroom toiletries", completed: false },
      { id: 2, title: "Restock kitchen paper goods", completed: false },
      { id: 3, title: "Check and replace light bulbs", completed: false },
      { id: 4, title: "Refill cleaning supplies", completed: false },
    ],
  },
  {
    id: 4,
    title: "Villa Oceana Deep Cleaning",
    property: "Villa Oceana",
    type: "Housekeeping",
    status: "Completed",
    priority: "Low",
    dueDate: "2025-04-03T13:00:00",
    assignee: "Maria Kowalska",
    description: "Perform quarterly deep cleaning of all areas",
    checklist: [
      { id: 1, title: "Deep clean carpets", completed: true },
      { id: 2, title: "Clean windows inside and out", completed: true },
      { id: 3, title: "Clean behind furniture", completed: true },
      { id: 4, title: "Clean air vents", completed: true },
      { id: 5, title: "Pressure wash outdoor areas", completed: true },
    ],
  },
];

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null);

  const filteredTasks = tasks.filter((task) => {
    // Filter by search query
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "Pending") ||
      (activeTab === "inProgress" && task.status === "In Progress") ||
      (activeTab === "completed" && task.status === "Completed");

    return matchesSearch && matchesTab;
  });

  const handleOpenTask = (task: typeof tasks[0]) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      toast.success(`Task "${selectedTask.title}" marked as complete!`);
      handleCloseTask();
    }
  };

  const handleToggleChecklistItem = (itemId: number) => {
    if (selectedTask) {
      const updatedChecklist = selectedTask.checklist.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      
      setSelectedTask({
        ...selectedTask,
        checklist: updatedChecklist,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage housekeeping, maintenance, and inventory tasks.
          </p>
        </div>
        <Button onClick={() => toast.info("Task creation form would open here.")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          className="w-full sm:w-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => handleOpenTask(task)} />
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>{selectedTask.title}</CardTitle>
              <CardDescription>
                {selectedTask.property} • {selectedTask.type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Task Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge variant={selectedTask.status === "Completed" ? "outline" : "default"}>
                      {selectedTask.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>{" "}
                    <Badge
                      variant="outline"
                      className={
                        selectedTask.priority === "High"
                          ? "text-red-500 border-red-200"
                          : selectedTask.priority === "Medium"
                          ? "text-amber-500 border-amber-200"
                          : "text-blue-500 border-blue-200"
                      }
                    >
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due:</span>{" "}
                    {new Date(selectedTask.dueDate).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assignee:</span>{" "}
                    {selectedTask.assignee}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTask.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Checklist</h3>
                <div className="space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => handleToggleChecklistItem(item.id)}
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`text-sm ${
                          item.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Photo Verification</h3>
                <div className="grid grid-cols-3 gap-2">
                  {/* Placeholder for photo verification */}
                  <div className="bg-secondary rounded flex items-center justify-center h-24">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="bg-secondary rounded flex items-center justify-center h-24">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="bg-secondary rounded flex items-center justify-center h-24">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCloseTask}>
                Close
              </Button>
              <Button
                onClick={handleCompleteTask}
                disabled={!selectedTask.checklist.every((item) => item.completed)}
              >
                Mark as Complete
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    property: string;
    type: string;
    status: string;
    priority: string;
    dueDate: string;
    assignee: string;
  };
  onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const statusColors = {
    Pending: "bg-blue-100 text-blue-800",
    "In Progress": "bg-amber-100 text-amber-800",
    Completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-blue-100 text-blue-800",
  };

  const typeColors = {
    Housekeeping: "border-blue-200 text-blue-800",
    Maintenance: "border-amber-200 text-amber-800",
    Inventory: "border-purple-200 text-purple-800",
  };

  return (
    <Card
      className="hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{task.title}</h3>
              <Badge
                variant="outline"
                className={typeColors[task.type as keyof typeof typeColors]}
              >
                {task.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{task.property}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleString("en-US", { 
                month: "short", 
                day: "numeric",
                hour: "numeric",
                minute: "2-digit" 
              })}
            </span>
            <Badge
              className={priorityColors[task.priority as keyof typeof priorityColors]}
            >
              {task.priority}
            </Badge>
            <Badge
              className={statusColors[task.status as keyof typeof statusColors]}
            >
              {task.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Tasks;
