import React from "react";
import { Helmet } from "react-helmet-async";

interface TaskHeaderProps {
  onCreateTask: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ onCreateTask }) => {
  return (
    <>
      <Helmet>
        <title>Task Management - Arivia Villas</title>
        <meta name="description" content="Manage and track housekeeping tasks across all properties with our comprehensive task management system." />
        <meta name="keywords" content="task management, housekeeping, property management, cleaning tasks, maintenance" />
      </Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Manage housekeeping tasks across all properties</p>
        </div>
      </div>
    </>
  );
};

export default TaskHeader;