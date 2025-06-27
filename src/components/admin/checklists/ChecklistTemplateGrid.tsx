
import React from 'react';
import { ChecklistTemplate } from '@/types/checklistTypes';
import ChecklistTemplateCard from './ChecklistTemplateCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ChecklistTemplateGridProps {
  templates: ChecklistTemplate[];
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onUse: (templateId: string) => void;
}

const ChecklistTemplateGrid: React.FC<ChecklistTemplateGridProps> = ({
  templates,
  onEdit,
  onDelete,
  onUse
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <ChecklistTemplateCard
          key={template.id}
          template={template}
          onEdit={() => onEdit(template.id)}
          onDelete={() => onDelete(template.id)}
          onUse={() => onUse(template.id)}
        />
      ))}
    </div>
  );
};

export default ChecklistTemplateGrid;
