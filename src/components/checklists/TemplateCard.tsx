import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit2, Copy, Trash2, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ChecklistTemplate, CHECKLIST_TYPE_LABELS, CHECKLIST_TYPE_COLORS } from '@/types/checklists.types';

interface TemplateCardProps {
  template: ChecklistTemplate;
  onEdit: (template: ChecklistTemplate) => void;
  onDuplicate: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  sectionsCount: number;
  itemsCount: number;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  sectionsCount,
  itemsCount
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleEdit = () => {
    onEdit(template);
    setIsDropdownOpen(false);
  };

  const handleDuplicate = () => {
    onDuplicate(template.id);
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    onDelete(template.id);
    setIsDropdownOpen(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
            {template.title || template.name}
          </CardTitle>
          <Badge 
            className={`text-xs font-medium ${CHECKLIST_TYPE_COLORS[template.type]}`}
            variant="outline"
          >
            {CHECKLIST_TYPE_LABELS[template.type]}
          </Badge>
        </div>
          
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-background border border-border shadow-lg z-50"
            >
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {template.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {template.description}
          </p>
        )}
        
        {/* Content Summary */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{sectionsCount} sections, {itemsCount} items</span>
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Updated {format(template.updatedAt, 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
};