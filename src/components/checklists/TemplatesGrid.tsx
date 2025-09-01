import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { ChecklistTemplate } from '@/types/checklistTypes';

interface TemplatesGridProps {
  templates: ChecklistTemplate[];
  loading: boolean;
  onCreateTemplate: () => void;
  onEditTemplate: (template: ChecklistTemplate) => void;
  onDuplicateTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  getTemplateStats: (template: ChecklistTemplate) => { sectionsCount: number; itemsCount: number };
}

export const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  templates,
  loading,
  onCreateTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  getTemplateStats
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            Loading templates...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Checklist Templates Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first checklist template to standardize operations and ensure quality control across all tasks.
            </p>
            <Button onClick={onCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const stats = getTemplateStats(template);
        return (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={onEditTemplate}
            onDuplicate={onDuplicateTemplate}
            onDelete={onDeleteTemplate}
            sectionsCount={stats.sectionsCount}
            itemsCount={stats.itemsCount}
          />
        );
      })}
    </div>
  );
};