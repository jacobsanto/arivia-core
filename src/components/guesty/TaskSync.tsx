
import { useState } from 'react';
import { useGuesty } from '@/contexts/GuestyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ArrowDown, ArrowUp, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toastService } from '@/services/toast/toast.service';

export default function TaskSync() {
  const { tasks } = useGuesty();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const syncAllTasks = async () => {
    try {
      setSyncInProgress(true);
      // This would typically be implemented to synchronize tasks
      // between Guesty and your local database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toastService.success('Tasks synchronized', {
        description: `${tasks.tasks.length} tasks have been synced from Guesty`
      });
    } catch (error) {
      toastService.error('Sync failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge variant="destructive" className="ml-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High</Badge>;
      case 'medium':
        return <Badge className="ml-2 flex items-center gap-1 bg-amber-500 hover:bg-amber-600"><Clock className="w-3 h-3" /> Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline" className="ml-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge variant="default" className="ml-2 flex items-center gap-1 bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3" /> Completed</Badge>;
      case 'inProgress':
        return <Badge variant="default" className="ml-2 flex items-center gap-1 bg-blue-500 hover:bg-blue-600"><Clock className="w-3 h-3" /> In Progress</Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="ml-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Canceled</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="ml-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
    }
  };

  const filteredTasks = tasks.tasks.filter(task => {
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'inProgress') return task.status === 'inProgress';
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'canceled') return task.status === 'canceled';
    return true; // 'all' tab
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>Guesty Task Sync</span>
          <Button 
            onClick={syncAllTasks} 
            disabled={syncInProgress || tasks.isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardTitle>
        <CardDescription>
          Synchronize tasks between Guesty and Arivia Villas
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs 
          defaultValue="pending" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {tasks.isLoading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div key={task._id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">
                        {task.title}
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {task.description && task.description.length > 150 
                        ? `${task.description.substring(0, 150)}...` 
                        : task.description}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {format(new Date(task.due), 'PP')}</span>
                      </div>
                      {task.listingId && (
                        <div className="text-right text-sm text-muted-foreground">
                          Property ID: {task.listingId.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredTasks.length} tasks
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={tasks.prevPage}
            disabled={tasks.queryParams.skip === 0}
            className="flex items-center gap-1"
          >
            <ArrowUp className="h-4 w-4" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={tasks.nextPage}
            disabled={filteredTasks.length < (tasks.queryParams.limit || 20)}
            className="flex items-center gap-1"
          >
            Next <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
