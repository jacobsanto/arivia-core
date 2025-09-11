import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Clock, Zap } from 'lucide-react';
import { CleaningAction } from '@/hooks/useRuleBasedCleaningSystem';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import { toast } from '@/hooks/use-toast';

interface CleaningActionsManagerProps {
  actions: CleaningAction[];
  onActionCreated: (action: CleaningAction) => void;
  onActionUpdated: (action: CleaningAction) => void;
  onActionDeleted: (actionId: string) => void;
}

export const CleaningActionsManager: React.FC<CleaningActionsManagerProps> = ({
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
    estimated_duration: 60,
    category: 'cleaning'
  });

  const categories = [
    { value: 'cleaning', label: 'Cleaning', color: 'bg-blue-100 text-blue-800' },
    { value: 'linen', label: 'Linen & Towels', color: 'bg-purple-100 text-purple-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    { value: 'inspection', label: 'Inspection', color: 'bg-green-100 text-green-800' },
    { value: 'restocking', label: 'Restocking', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const handleOpenDialog = (action?: CleaningAction) => {
    if (action) {
      setEditingAction(action);
      setFormData({
        action_name: action.action_name,
        display_name: action.display_name,
        description: action.description || '',
        estimated_duration: action.estimated_duration,
        category: action.category
      });
    } else {
      setEditingAction(null);
      setFormData({
        action_name: '',
        display_name: '',
        description: '',
        estimated_duration: 60,
        category: 'cleaning'
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
        .delete()
        .eq('id', action.id);

      if (error) throw error;

      onActionDeleted(action.id);
      toast({
        title: "Action Deleted",
        description: `"${action.display_name}" has been deleted successfully`,
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
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cleaning Actions</h3>
          <p className="text-sm text-muted-foreground">
            Manage the available cleaning actions for your rules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAction ? 'Edit Cleaning Action' : 'Create New Cleaning Action'}
              </DialogTitle>
              <DialogDescription>
                {editingAction 
                  ? 'Update the details of this cleaning action.'
                  : 'Define a new cleaning action for your rules.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="action_name">Action Key</Label>
                  <Input
                    id="action_name"
                    value={formData.action_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, action_name: e.target.value }))}
                    placeholder="e.g., deep_cleaning"
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., Deep Cleaning"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this action involves..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
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
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingAction ? 'Update Action' : 'Create Action'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.length === 0 ? (
          <Card className="md:col-span-2 p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No cleaning actions found</h3>
              <p className="text-sm text-muted-foreground">
                Create your first cleaning action to start building rules
              </p>
            </div>
          </Card>
        ) : (
          actions.map(action => (
            <Card key={action.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{action.display_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge className={getCategoryColor(action.category)}>
                        {categories.find(c => c.value === action.category)?.label || action.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {action.estimated_duration}min
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(action)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(action)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {action.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};