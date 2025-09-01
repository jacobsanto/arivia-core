import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { ChecklistSection as ChecklistSectionType, ChecklistTemplateItem } from '@/types/checklists.types';
import { ChecklistItem, AddItemButton } from './ChecklistItem';

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  onUpdateSection: (sectionId: string, title: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateItem: (sectionId: string, itemId: string, text: string) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onAddItem: (sectionId: string) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  section,
  onUpdateSection,
  onDeleteSection,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  dragHandleProps,
  isDragging
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateSection(section.id, editTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const handleCancelTitle = () => {
    setEditTitle(section.title);
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelTitle();
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      isDragging ? 'opacity-50 rotate-1 scale-105 shadow-lg' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div 
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Section Title */}
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveTitle}
                autoFocus
                className="font-medium"
              />
            ) : (
              <h3 
                className="font-medium text-lg cursor-pointer hover:text-primary"
                onClick={() => setIsEditingTitle(true)}
              >
                {section.title}
              </h3>
            )}
          </div>

          {/* Delete Section Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteSection(section.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Section Items */}
        {section.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onUpdate={(itemId, text) => onUpdateItem(section.id, itemId, text)}
            onDelete={(itemId) => onDeleteItem(section.id, itemId)}
          />
        ))}

        {/* Add Item Button */}
        <AddItemButton onAdd={() => onAddItem(section.id)} />
      </CardContent>
    </Card>
  );
};

interface AddSectionButtonProps {
  onAdd: () => void;
}

export const AddSectionButton: React.FC<AddSectionButtonProps> = ({ onAdd }) => {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors">
      <CardContent className="p-6">
        <Button
          variant="ghost"
          onClick={onAdd}
          className="w-full h-full min-h-[60px] text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
};