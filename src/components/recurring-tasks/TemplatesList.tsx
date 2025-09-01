import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Plus, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { RecurringTaskTemplate, TASK_MODULE_LABELS, PRIORITY_LABELS } from '@/types/recurringTasks.types';

interface TemplatesListProps {
  templates: RecurringTaskTemplate[];
  onCreateTemplate: () => void;
  onEditTemplate: (template: RecurringTaskTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onToggleStatus: (templateId: string, isActive: boolean) => void;
  getRuleDescription: (template: RecurringTaskTemplate) => string;
  getTaskTypeLabel: (taskModule: any, baseTaskType: any) => string;
  getApplicabilityText: (template: RecurringTaskTemplate) => string;
  getStaffName: (staffId?: string) => string;
  loading: boolean;
}

export const TemplatesList: React.FC<TemplatesListProps> = ({
  templates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onToggleStatus,
  getRuleDescription,
  getTaskTypeLabel,
  getApplicabilityText,
  getStaffName,
  loading
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recurring Task Templates
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Automate routine maintenance and cleaning tasks
            </p>
          </div>
          <Button onClick={onCreateTemplate} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Recurring Tasks Yet</h3>
            <p className="mb-4">Create your first recurring task template to start automating routine work.</p>
            <Button onClick={onCreateTemplate} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Template Title</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Recurrence Rule</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {TASK_MODULE_LABELS[template.taskModule]} • {getTaskTypeLabel(template.taskModule, template.baseTaskType)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{getApplicabilityText(template)}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{getRuleDescription(template)}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(template.nextDueDate, 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{getStaffName(template.assignedTo)}</div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getPriorityColor(template.priority) as any} className="text-xs">
                        {PRIORITY_LABELS[template.priority]}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={(checked) => onToggleStatus(template.id, checked)}
                          disabled={loading}
                        />
                        <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                          {template.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTemplate(template)}
                          disabled={loading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTemplate(template.id)}
                          disabled={loading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};