
import React, { useState } from "react";
import { Task } from "@/types/housekeepingTypes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HousekeepingTaskCard from "./HousekeepingTaskCard";
import { SwipeableList } from "@/components/ui/swipeable-list";

interface HousekeepingMobileViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onAssignTask: (taskId: string, staffMember: string) => Promise<void>;
  cleaningDefinitions: Record<string, string>;
  isActuallyMobile: boolean;
}

const HousekeepingMobileView: React.FC<HousekeepingMobileViewProps> = ({
  tasks,
  onStatusChange,
  onAssignTask,
  cleaningDefinitions,
  isActuallyMobile
}) => {
  const [activeTab, setActiveTab] = useState<string>("pending");
  
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const handleSwipeRight = (task: Task) => {
    if (task.status === 'pending') {
      onStatusChange(task.id, 'in-progress');
    } else if (task.status === 'in-progress') {
      onStatusChange(task.id, 'done');
    }
  };

  const handleSwipeLeft = (task: Task) => {
    if (task.status === 'in-progress') {
      onStatusChange(task.id, 'pending');
    } else if (task.status === 'done') {
      onStatusChange(task.id, 'in-progress');
    }
  };

  const getSwipeRightText = (status: string) => {
    if (status === 'pending') return "Start";
    if (status === 'in-progress') return "Complete";
    return "";
  };

  const getSwipeLeftText = (status: string) => {
    if (status === 'in-progress') return "Move to Pending";
    if (status === 'done') return "Reopen";
    return "";
  };

  const renderTaskList = (taskList: Task[], status: string) => {
    if (taskList.length === 0) {
      return (
        <div className="flex justify-center items-center h-32 text-muted-foreground text-sm border border-dashed rounded-md">
          No {status} tasks
        </div>
      );
    }

    if (isActuallyMobile) {
      return (
        <SwipeableList
          items={taskList}
          keyExtractor={(task) => task.id}
          renderItem={(task) => (
            <HousekeepingTaskCard
              task={task}
              onStatusChange={onStatusChange}
              onAssignTask={onAssignTask}
              cleaningDefinitions={cleaningDefinitions}
            />
          )}
          onSwipeLeft={status !== 'pending' ? (task) => handleSwipeLeft(task) : undefined}
          onSwipeRight={status !== 'done' ? (task) => handleSwipeRight(task) : undefined}
          swipeLeftText={getSwipeLeftText(status)}
          swipeRightText={getSwipeRightText(status)}
          showIndicators={true}
        />
      );
    } else {
      return taskList.map((task) => (
        <HousekeepingTaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onAssignTask={onAssignTask}
          cleaningDefinitions={cleaningDefinitions}
        />
      ));
    }
  };

  return (
    <Tabs defaultValue="pending" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="pending" className="relative">
          Pending
          {pendingTasks.length > 0 && (
            <span className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {pendingTasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="in-progress" className="relative">
          In Progress
          {inProgressTasks.length > 0 && (
            <span className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {inProgressTasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="done" className="relative">
          Done
          {doneTasks.length > 0 && (
            <span className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {doneTasks.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="min-h-[300px]">
        {renderTaskList(pendingTasks, 'pending')}
      </TabsContent>
      
      <TabsContent value="in-progress" className="min-h-[300px]">
        {renderTaskList(inProgressTasks, 'in-progress')}
      </TabsContent>
      
      <TabsContent value="done" className="min-h-[300px]">
        {renderTaskList(doneTasks, 'done')}
      </TabsContent>
    </Tabs>
  );
};

export default HousekeepingMobileView;
