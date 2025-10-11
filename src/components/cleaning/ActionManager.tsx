import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import { CleaningAction } from '@/hooks/useRuleBasedCleaningSystem';

interface ActionManagerProps {
  actions: CleaningAction[];
  onActionCreated: (action: CleaningAction) => void;
  onActionUpdated: (action: CleaningAction) => void;
  onActionDeleted: (actionId: string) => void;
}

export const ActionManager: React.FC<ActionManagerProps> = ({
  actions,
  onActionCreated,
  onActionUpdated,
  onActionDeleted
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CleaningAction | null>(null);
  const [formData, setFormData] = useState({
    action_name: '',
    display_name: '',
    description: '',
    category: 'cleaning',
    estimated_duration: 60
  });

  const categories = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'linen', label: 'Linen & Towels' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'restocking', label: 'Restocking' }
  ];

  const handleOpenDialog = (action?: CleaningAction) => {
    if (action) {
      setEditingAction(action);
      setFormData({
        action_name: action.action_name,
        display_name: action.display_name,
        description: action.description || '',
        category: action.category,
        estimated_duration: action.estimated_duration
      });
    } else {
      setEditingAction(null);
      setFormData({
        action_name: '',
        display_name: '',
        description: '',
        category: 'cleaning',
        estimated_duration: 60
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.action_name.trim() || !formData.display_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Action name and display name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAction) {
        // Update existing action
        const { data, error } = await supabase
          .from('cleaning_actions')
          .update(formData)
          .eq('id', editingAction.id)
          .select()
          .single();

        if (error) throw error;

        const updatedAction: CleaningAction = {
          ...data,
          is_active: true
        };

        onActionUpdated(updatedAction);
        toast({
          title: "Action Updated",
          description: `"${formData.display_name}" has been updated successfully`,
        });
      } else {
        // Create new action
        const { data, error } = await supabase
          .from('cleaning_actions')
          .insert([{ ...formData, is_active: true }])
          .select()
          .single();

        if (error) throw error;

        const newAction: CleaningAction = {
          ...data,
          is_active: true
        };

        onActionCreated(newAction);
        toast({
          title: "Action Created",
          description: `"${formData.display_name}" has been created successfully`,
        });
      }

      setIsDialogOpen(false);
    } catch (err) {
      logger.error('Error saving action:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save action',
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (action: CleaningAction) => {
    if (!confirm(`Are you sure you want to delete "${action.display_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cleaning_actions')
        .update({ is_active: false })
        .eq('id', action.id);

      if (error) throw error;

      onActionDeleted(action.id);
      toast({
        title: "Action Deleted",
        description: `"${action.display_name}" has been deleted`,
      });
    } catch (err) {
      logger.error('Error deleting action:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete action',
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      cleaning: 'bg-blue-100 text-blue-800',
      linen: 'bg-green-100 text-green-800',
      maintenance: 'bg-orange-100 text-orange-800',
      inspection: 'bg-purple-100 text-purple-800',
      restocking: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Cleaning Actions</h3>
          <p className="text-sm text-muted-foreground">
            Manage the available cleaning actions for your rules
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      <div className="grid gap-4">
        {actions.map((action) => (
          <Card key={action.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{action.display_name}</h4>
                    <Badge className={getCategoryColor(action.category)}>
                      {action.category}
                    </Badge>
                    <Badge variant="outline">
                      {action.estimated_duration}min
                    </Badge>
                  </div>
                  {action.description && (
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Action ID: {action.action_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(action)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(action)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {actions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No cleaning actions found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  Create your first action
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? 'Edit Action' : 'Create New Action'}
            </DialogTitle>
            <DialogDescription>
              {editingAction 
                ? 'Update the action details below.'
                : 'Define a new cleaning action for your rules.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="action_name">Action ID</Label>
              <Input
                id="action_name"
                placeholder="e.g., deep_cleaning"
                value={formData.action_name}
                onChange={(e) => setFormData({ ...formData, action_name: e.target.value })}
                disabled={!!editingAction}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used internally. Cannot be changed after creation.
              </p>
            </div>

            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="e.g., Deep Cleaning"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimated_duration">Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="5"
                max="480"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 60 })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this action..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAction ? 'Update' : 'Create'} Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};