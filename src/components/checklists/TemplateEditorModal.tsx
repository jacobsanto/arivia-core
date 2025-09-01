import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { ChecklistTemplate, ChecklistSection as ChecklistSectionType, ChecklistType, CHECKLIST_TYPE_LABELS } from '@/types/checklistTypes';
import { ChecklistSection, AddSectionButton } from './ChecklistSection';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (templateId: string, updates: Partial<ChecklistTemplate>) => Promise<void>;
  template?: ChecklistTemplate;
  isLoading: boolean;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  template,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' as ChecklistType | '',
    sections: [] as ChecklistSectionType[]
  });

  // Initialize form data when template prop changes
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        description: template.description || '',
        type: template.type,
        sections: [...template.sections]
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: '',
        sections: []
      });
    }
  }, [template]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleAddSection = () => {
    const newSection: ChecklistSectionType = {
      id: generateId(),
      title: 'New Section',
      items: [],
      order: formData.sections.length + 1
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const handleUpdateSection = (sectionId: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, title } : section
      )
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const handleAddItem = (sectionId: string) => {
    const newItem = {
      id: generateId(),
      text: 'New checklist item',
      order: 1
    };

    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { 
              ...section, 
              items: [
                ...section.items,
                { ...newItem, order: section.items.length + 1 }
              ]
            }
          : section
      )
    }));
  };

  const handleUpdateItem = (sectionId: string, itemId: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, text } : item
              )
            }
          : section
      )
    }));
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter(item => item.id !== itemId)
            }
          : section
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.type) {
      return;
    }

    const templateData = {
      title: formData.title.trim(),
      name: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      category: formData.type === 'housekeeping' ? 'Housekeeping' : 
               formData.type === 'maintenance' ? 'Maintenance' : 'Inspection',
      sections: formData.sections,
      items: formData.sections.flatMap(section => 
        section.items?.map((item, index) => ({
          id: Date.now() + index,
          title: item.text,
          completed: false
        })) || []
      ),
      isActive: true,
      createdBy: 'current-user-id'
    };

    if (template && onUpdate) {
      await onUpdate(template.id, templateData);
    } else {
      await onSave(templateData);
    }
    
    onClose();
  };

  const isValid = formData.title.trim() && formData.type;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Checklist Template' : 'Create New Checklist Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Top-Level Configuration */}
          <div className="grid gap-4 py-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Standard Turnover Clean"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ChecklistType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {Object.entries(CHECKLIST_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{String(label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of this checklist template..."
                rows={2}
              />
            </div>
          </div>

          {/* Main Editor Body */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 py-4">
                {formData.sections.map((section) => (
                  <ChecklistSection
                    key={section.id}
                    section={section}
                    onUpdateSection={handleUpdateSection}
                    onDeleteSection={handleDeleteSection}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                    onAddItem={handleAddItem}
                  />
                ))}

                <AddSectionButton onAdd={handleAddSection} />
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {template ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditorModal;