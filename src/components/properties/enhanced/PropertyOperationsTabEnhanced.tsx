import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Clock, 
  User,
  Calendar,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Wrench,
  Sparkles,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OperationsTask {
  id: string;
  type: 'housekeeping' | 'maintenance';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  estimatedDuration: number;
  dependencies?: string[];
  tags?: string[];
  room?: string;
  created: string;
  updated: string;
}

interface PropertyOperationsTabEnhancedProps {
  propertyId: string;
}

export const PropertyOperationsTabEnhanced: React.FC<PropertyOperationsTabEnhancedProps> = ({ 
  propertyId 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Mock data - would be fetched based on propertyId
  const mockTasks: OperationsTask[] = [
    {
      id: '1',
      type: 'housekeeping',
      title: 'Deep Clean Master Bedroom',
      description: 'Complete deep cleaning including bathroom, changing linens, and sanitizing surfaces',
      status: 'pending',
      priority: 'high',
      assignee: 'Maria Garcia',
      dueDate: new Date().toISOString(),
      estimatedDuration: 90,
      room: 'Master Bedroom',
      tags: ['deep-clean', 'bathroom'],
      created: new Date(Date.now() - 86400000).toISOString(),
      updated: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Fix Pool Pump Motor',
      description: 'Pool pump making unusual noise. Suspected motor bearing issue. May need replacement.',
      status: 'in_progress',
      priority: 'medium',
      assignee: 'John Smith',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      estimatedDuration: 120,
      room: 'Pool Area',
      tags: ['mechanical', 'urgent-booking'],
      dependencies: ['obtain-pump-parts'],
      created: new Date(Date.now() - 172800000).toISOString(),
      updated: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '3',
      type: 'housekeeping',
      title: 'Replace Living Room Cushions',
      description: 'Guest reported stain on main sofa cushions. Replace with backup set.',
      status: 'completed',
      priority: 'medium',
      assignee: 'Elena Papadopoulos',
      dueDate: new Date(Date.now() - 43200000).toISOString(),
      estimatedDuration: 30,
      room: 'Living Room',
      tags: ['guest-issue', 'replacement'],
      created: new Date(Date.now() - 259200000).toISOString(),
      updated: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'AC Unit Maintenance Check',
      description: 'Routine maintenance and filter replacement for main AC unit',
      status: 'pending',
      priority: 'low',
      assignee: 'Dimitris Kostas',
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      estimatedDuration: 60,
      room: 'Main Unit',
      tags: ['routine', 'preventive'],
      created: new Date(Date.now() - 86400000).toISOString(),
      updated: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      const matchesSearch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.room?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesType = typeFilter === "all" || task.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [mockTasks, searchQuery, statusFilter, typeFilter]);

  const taskStats = useMemo(() => {
    const stats = mockTasks.reduce((acc, task) => {
      acc.total++;
      acc[task.status] = (acc[task.status] || 0) + 1;
      if (task.priority === 'urgent' || task.priority === 'high') {
        acc.urgent++;
      }
      return acc;
    }, { total: 0, urgent: 0 } as Record<string, number>);
    
    return stats;
  }, [mockTasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'housekeeping' 
      ? <Sparkles className="h-4 w-4 text-blue-600" />
      : <Wrench className="h-4 w-4 text-orange-600" />;
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Urgent</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{taskStats.urgent || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{taskStats.in_progress || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{taskStats.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operations Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{task.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(task.type)}
                        <Badge variant="outline" className="capitalize">
                          {task.type}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(task.priority)} className="capitalize">
                        {task.priority}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.assignee}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {task.estimatedDuration}min
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{task.room}</span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {task.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            Start Task
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button variant="default" size="sm">
                            Complete
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No tasks found
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? "Try adjusting your filters to see more results."
                  : "No operational tasks have been created for this property yet."
                }
              </div>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => setShowCreateTask(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Form (simplified version) */}
      {showCreateTask && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Task title" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea placeholder="Task description" rows={3} />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateTask(false)}>
                  Create Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};