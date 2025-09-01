import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { ChecklistTemplateItem } from '@/types/checklists.types';

interface ChecklistItemProps {
  item: ChecklistTemplateItem;
  onUpdate: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  onUpdate,
  onDelete,
  dragHandleProps,
  isDragging
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(item.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(item.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`group flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
      isDragging ? 'opacity-50 rotate-2 scale-105' : ''
    }`}>
      {/* Drag Handle */}
      <div 
        {...dragHandleProps}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Item Content */}
      <div className="flex-1">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              autoFocus
              className="text-sm"
            />
          </div>
        ) : (
          <div 
            className="text-sm cursor-pointer hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {item.text}
          </div>
        )}
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface AddItemButtonProps {
  onAdd: () => void;
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({ onAdd }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onAdd}
      className="w-full justify-start text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Item
    </Button>
  );
};