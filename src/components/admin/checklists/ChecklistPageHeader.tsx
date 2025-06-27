
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

interface ChecklistPageHeaderProps {
  onCreateTemplate?: () => void;
}

const ChecklistPageHeader: React.FC<ChecklistPageHeaderProps> = ({ onCreateTemplate }) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Checklist Templates</CardTitle>
        </div>
        <CardDescription>
          Create and manage reusable checklist templates for different tasks and operations.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ChecklistPageHeader;
