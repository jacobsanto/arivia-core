
import React from 'react';
import { format } from 'date-fns';

interface DashboardHeadingProps {
  lastRefreshTime: string;
}

const DashboardHeading: React.FC<DashboardHeadingProps> = ({ lastRefreshTime }) => {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');
  
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        {formattedDate}{' '}
        <span className="text-xs">
          (Last updated: {lastRefreshTime})
        </span>
      </p>
    </div>
  );
};

export default DashboardHeading;
