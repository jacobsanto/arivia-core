
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Copy, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistTemplate } from "@/types/checklistTypes";

interface ChecklistTemplateCardProps {
  template: ChecklistTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUse: () => void;
}

const ChecklistTemplateCard = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
}: ChecklistTemplateCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant={template.isDefault ? "secondary" : "outline"}>
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{template.description}</p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Items ({template.items.length})</p>
            <ul className="text-sm space-y-1">
              {template.items.slice(0, 3).map((item) => (
                <li key={item.id} className="truncate">
                  • {item.title}
                </li>
              ))}
              {template.items.length > 3 && (
                <li className="text-muted-foreground">
                  + {template.items.length - 3} more items
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Created by: {template.createdBy}</span>
            <span>
              {new Date(template.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between pt-2">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onEdit}
                title="Edit template"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              {!template.isDefault && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onDelete}
                  title="Delete template"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onDuplicate}
                title="Duplicate template"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUse}
              className="flex items-center"
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              Use Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistTemplateCard;
