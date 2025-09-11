import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  Globe, 
  Building,
  Settings,
  Eye
} from 'lucide-react';
import { CleaningTemplate } from '@/hooks/useAdvancedCleaningSystem';

interface TemplateLibraryProps {
  templates: CleaningTemplate[];
  onCreateTemplate: (template: Omit<CleaningTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<CleaningTemplate>;
  onUpdateTemplate: (id: string, updates: Partial<CleaningTemplate>) => Promise<CleaningTemplate>;
  onSelectTemplate: (template: CleaningTemplate | null) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onSelectTemplate
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CleaningTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_global: false,
    template_data: {}
  });

  const handleCreateTemplate = async () => {
    try {
      await onCreateTemplate(formData);
      setShowCreateDialog(false);
      setFormData({ name: '', description: '', is_global: false, template_data: {} });
    } catch (error) {
      logger.error('Failed to create template:', error);
    }
  };

  const handleEditTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      await onUpdateTemplate(editingTemplate.id, formData);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', is_global: false, template_data: {} });
    } catch (error) {
      logger.error('Failed to update template:', error);
    }
  };

  const openEditDialog = (template: CleaningTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      is_global: template.is_global,
      template_data: template.template_data
    });
  };

  const globalTemplates = templates.filter(t => t.is_global);
  const customTemplates = templates.filter(t => !t.is_global);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Template Library</h2>
          <p className="text-muted-foreground">
            Manage reusable cleaning configuration templates
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Global Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium">Global Templates</h3>
          <Badge variant="default">{globalTemplates.length}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => openEditDialog(template)}
              onView={() => onSelectTemplate(template)}
              onDuplicate={() => {
                setFormData({
                  name: `${template.name} (Copy)`,
                  description: template.description || '',
                  is_global: false,
                  template_data: template.template_data
                });
                setShowCreateDialog(true);
              }}
            />
          ))}
          {globalTemplates.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Globe className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  No global templates created yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Custom Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium">Custom Templates</h3>
          <Badge variant="secondary">{customTemplates.length}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => openEditDialog(template)}
              onView={() => onSelectTemplate(template)}
              onDuplicate={() => {
                setFormData({
                  name: `${template.name} (Copy)`,
                  description: template.description || '',
                  is_global: false,
                  template_data: template.template_data
                });
                setShowCreateDialog(true);
              }}
            />
          ))}
          {customTemplates.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Building className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  No custom templates created yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingTemplate} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingTemplate(null);
          setFormData({ name: '', description: '', is_global: false, template_data: {} });
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update template information' : 'Create a reusable cleaning configuration template'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this template's purpose"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_global"
                checked={formData.is_global}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_global: checked }))}
              />
              <Label htmlFor="is_global">
                Global Template (can be used across all properties)
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingTemplate(null);
                setFormData({ name: '', description: '', is_global: false, template_data: {} });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingTemplate ? handleEditTemplate : handleCreateTemplate}
              disabled={!formData.name.trim()}
            >
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateCardProps {
  template: CleaningTemplate;
  onEdit: () => void;
  onView: () => void;
  onDuplicate: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onEdit, 
  onView, 
  onDuplicate 
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {template.is_global ? (
            <Globe className="h-4 w-4 text-blue-500" />
          ) : (
            <Building className="h-4 w-4 text-green-500" />
          )}
          <Badge variant={template.is_global ? "default" : "secondary"} className="text-xs">
            {template.is_global ? 'Global' : 'Custom'}
          </Badge>
        </div>
      </div>
      <CardTitle className="text-lg">{template.name}</CardTitle>
      <CardDescription className="line-clamp-2">
        {template.description || 'No description available'}
      </CardDescription>
    </CardHeader>
    
    <CardContent className="pt-0">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
        <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onView} className="flex-1">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={onDuplicate}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);