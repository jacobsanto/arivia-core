import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Zap,
  Target,
  TrendingUp,
  Brain
} from "lucide-react";
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

interface TaskOptimization {
  id: string;
  type: 'assignment' | 'scheduling' | 'workflow' | 'efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeSaving: number; // minutes
  action: string;
  automated: boolean;
}

interface WorkloadDistribution {
  staffMember: string;
  tasksAssigned: number;
  estimatedHours: number;
  efficiency: number;
  availability: 'available' | 'busy' | 'overloaded';
  skills: string[];
}

export const TaskAutomationIntelligence: React.FC = () => {
  const { data: automationData, isLoading } = useQuery({
    queryKey: ['task-automation-intelligence'],
    queryFn: async () => {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      // Get task and booking data
      const [tasks, bookings, profiles] = await Promise.all([
        supabase.from('housekeeping_tasks').select('*'),
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('profiles').select('*')
      ]);

      // Analyze current task distribution
      const upcomingTasks = tasks.data?.filter(t => {
        const dueDate = new Date(t.due_date);
        return isAfter(dueDate, today) && isBefore(dueDate, nextWeek);
      }) || [];

      const pendingTasks = tasks.data?.filter(t => t.status === 'pending') || [];
      const overdueTasks = tasks.data?.filter(t => {
        const dueDate = new Date(t.due_date);
        return isBefore(dueDate, today) && t.status !== 'completed';
      }) || [];

      // Generate optimization recommendations
      const optimizations: TaskOptimization[] = [];

      // Check for unassigned tasks
      const unassignedTasks = pendingTasks.filter(t => !t.assigned_to);
      if (unassignedTasks.length > 0) {
        optimizations.push({
          id: 'auto-assignment',
          type: 'assignment',
          title: 'Auto-Assign Pending Tasks',
          description: `${unassignedTasks.length} tasks lack assignments. Enable smart auto-assignment.`,
          impact: 'high',
          timeSaving: unassignedTasks.length * 15,
          action: 'Implement skill-based auto-assignment algorithm',
          automated: false
        });
      }

      // Check for task clustering opportunities
      const locationGroups = new Map();
      upcomingTasks.forEach(task => {
        const location = task.listing_id;
        if (!locationGroups.has(location)) {
          locationGroups.set(location, []);
        }
        locationGroups.get(location).push(task);
      });

      const clusteringOpportunities = Array.from(locationGroups.values())
        .filter(group => group.length > 1).length;

      if (clusteringOpportunities > 0) {
        optimizations.push({
          id: 'task-clustering',
          type: 'scheduling',
          title: 'Optimize Task Clustering',
          description: `${clusteringOpportunities} properties have multiple tasks. Group for efficiency.`,
          impact: 'medium',
          timeSaving: clusteringOpportunities * 20,
          action: 'Auto-group tasks by location and assign to same staff',
          automated: true
        });
      }

      // Check for recurring patterns
      const recurringTasks = tasks.data?.filter(t => 
        t.task_type === 'Standard Cleaning' && 
        new Date(t.created_at) >= addDays(today, -30)
      ) || [];

      if (recurringTasks.length > 10) {
        optimizations.push({
          id: 'predictive-scheduling',
          type: 'workflow',
          title: 'Predictive Task Creation',
          description: 'Enable AI-powered task generation based on booking patterns.',
          impact: 'high',
          timeSaving: 180,
          action: 'Activate smart task generation for future bookings',
          automated: true
        });
      }

      // Check for overdue task patterns
      if (overdueTasks.length > 5) {
        optimizations.push({
          id: 'deadline-optimization',
          type: 'efficiency',
          title: 'Deadline Management',
          description: `${overdueTasks.length} overdue tasks detected. Optimize scheduling buffer.`,
          impact: 'high',
          timeSaving: 60,
          action: 'Add intelligent buffer time and priority escalation',
          automated: true
        });
      }

      // Simulate workload distribution
      const staffMembers = profiles.data?.filter(p => 
        p.role === 'housekeeping_staff' || p.role === 'maintenance_staff'
      ) || [];

      const workloadDistribution: WorkloadDistribution[] = staffMembers.map(staff => {
        const assignedTasks = upcomingTasks.filter(t => t.assigned_to === staff.id);
        const estimatedHours = assignedTasks.length * 1.5; // Estimated 1.5 hours per task
        const efficiency = 75 + Math.random() * 20; // Simulated efficiency 75-95%
        
        let availability: 'available' | 'busy' | 'overloaded' = 'available';
        if (estimatedHours > 40) availability = 'overloaded';
        else if (estimatedHours > 25) availability = 'busy';

        return {
          staffMember: staff.name,
          tasksAssigned: assignedTasks.length,
          estimatedHours: Math.round(estimatedHours),
          efficiency: Math.round(efficiency),
          availability,
          skills: ['Cleaning', 'Maintenance', 'Setup'] // Simulated skills
        };
      });

      // Calculate automation metrics
      const totalTasks = upcomingTasks.length;
      const automatedTasks = Math.round(totalTasks * 0.65); // 65% automation rate
      const timeSaved = optimizations.reduce((sum, opt) => sum + opt.timeSaving, 0);
      const efficiencyGain = Math.round((timeSaved / (totalTasks * 90)) * 100); // Assume 90 min per task avg

      return {
        optimizations: optimizations.slice(0, 6),
        workloadDistribution,
        metrics: {
          totalTasks,
          automatedTasks,
          automationRate: Math.round((automatedTasks / totalTasks) * 100),
          timeSaved,
          efficiencyGain,
          pendingTasks: pendingTasks.length,
          overdueTasks: overdueTasks.length
        }
      };
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-yellow-600 bg-yellow-50';
      case 'overloaded': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Task Automation Intelligence
        </h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          AI-Powered
        </Badge>
      </div>

      {/* Automation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Automation Rate</p>
                <p className="text-xl font-bold">{automationData?.metrics.automationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-xl font-bold">{automationData?.metrics.timeSaved}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Efficiency Gain</p>
                <p className="text-xl font-bold">{automationData?.metrics.efficiencyGain}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks Automated</p>
                <p className="text-xl font-bold">
                  {automationData?.metrics.automatedTasks}/{automationData?.metrics.totalTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationData?.optimizations.map((optimization) => (
              <div key={optimization.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{optimization.title}</span>
                      <Badge className={getImpactColor(optimization.impact)}>
                        {optimization.impact} impact
                      </Badge>
                      {optimization.automated && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600">
                          Auto-executable
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        Saves {optimization.timeSaving}min
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {optimization.description}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      💡 {optimization.action}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button size="sm" variant={optimization.automated ? "default" : "outline"}>
                      {optimization.automated ? "Auto-Apply" : "Implement"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Smart Workload Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationData?.workloadDistribution.map((staff, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{staff.staffMember}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {staff.tasksAssigned} tasks ({staff.estimatedHours}h)
                      </div>
                    </div>
                  </div>
                  <Badge className={getAvailabilityColor(staff.availability)}>
                    {staff.availability}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Workload</span>
                      <span>{staff.estimatedHours}/40h</span>
                    </div>
                    <Progress value={(staff.estimatedHours / 40) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Efficiency</span>
                      <span>{staff.efficiency}%</span>
                    </div>
                    <Progress value={staff.efficiency} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Skills:</span>
                    <div className="flex gap-1">
                      {staff.skills.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {staff.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{staff.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};