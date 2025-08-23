import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Target, Clock, Calendar } from 'lucide-react';
import { CleaningRule, CleaningAction, RuleAssignment } from '@/hooks/useRuleBasedCleaningSystem';

interface CleaningRulesManagerProps {
  rules: CleaningRule[];
  actions: CleaningAction[];
  assignments: RuleAssignment[];
  onRuleCreated: (rule: Omit<CleaningRule, 'id' | 'created_at' | 'updated_at'>) => void;
  onRuleUpdated: (id: string, updates: Partial<CleaningRule>) => void;
  onRuleDeleted: (id: string) => void;
  onRuleAssigned: (ruleId: string, propertyIds: string[]) => void;
}

export const CleaningRulesManager: React.FC<CleaningRulesManagerProps> = ({
  rules,
  actions,
  assignments,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted,
  onRuleAssigned
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CleaningRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    task_type: 'cleaning',
    min_nights: 1,
    max_nights: 3,
    actions: {} as Record<string, string[]>,
    is_active: true,
    priority: 1
  });

  const handleOpenDialog = (rule?: CleaningRule) => {
    if (rule) {
      setEditingRule(rule);
      const stayLength = rule.conditions?.stay_length || { min: 1, max: 3 };
      setFormData({
        name: rule.name,
        task_type: rule.task_type,
        min_nights: stayLength.min,
        max_nights: stayLength.max,
        actions: rule.actions || {},
        is_active: rule.is_active,
        priority: rule.priority
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        task_type: 'cleaning',
        min_nights: 1,
        max_nights: 3,
        actions: {},
        is_active: true,
        priority: 1
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const conditions = {
      stay_length: {
        min: formData.min_nights,
        max: formData.max_nights
      }
    };

    const ruleData = {
      name: formData.name,
      task_type: formData.task_type,
      actions: formData.actions,
      conditions,
      is_active: formData.is_active,
      priority: formData.priority
    };

    if (editingRule) {
      onRuleUpdated(editingRule.id, ruleData);
    } else {
      onRuleCreated(ruleData);
    }
    setIsDialogOpen(false);
  };

  const handleActionToggle = (day: string, actionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        [day]: checked 
          ? [...(prev.actions[day] || []), actionId]
          : (prev.actions[day] || []).filter(id => id !== actionId)
      }
    }));
  };

  const getDayActions = (day: string) => formData.actions[day] || [];

  const days = ['check_in', 'during_stay', 'check_out'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cleaning Rules</h3>
          <p className="text-sm text-muted-foreground">
            Rules determine which cleaning actions are performed based on stay characteristics
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Cleaning Rule' : 'Create New Cleaning Rule'}
              </DialogTitle>
              <DialogDescription>
                Define the conditions and actions for this cleaning rule
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Up to 3 Nights Stay"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_nights">Minimum Nights</Label>
                  <Input
                    id="min_nights"
                    type="number"
                    value={formData.min_nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_nights: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_nights">Maximum Nights</Label>
                  <Input
                    id="max_nights"
                    type="number"
                    value={formData.max_nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_nights: parseInt(e.target.value) || 999 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div>
                <Label>Actions by Day</Label>
                <div className="mt-2 space-y-4">
                  {days.map(day => (
                    <Card key={day} className="p-4">
                      <h4 className="font-medium mb-2 capitalize">{day.replace('_', ' ')}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {actions.map(action => (
                          <div key={action.id} className="flex items-center space-x-2">
                            <Switch
                              id={`${day}-${action.id}`}
                              checked={getDayActions(day).includes(action.id)}
                              onCheckedChange={(checked) => handleActionToggle(day, action.id, checked)}
                            />
                            <Label htmlFor={`${day}-${action.id}`} className="text-sm">
                              {action.display_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Target className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No cleaning rules defined</h3>
              <p className="text-sm text-muted-foreground">
                Create your first cleaning rule to automate task assignment
              </p>
            </div>
          </Card>
        ) : (
          rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rule.conditions?.stay_length?.min || 1}-{rule.conditions?.stay_length?.max || 999} nights
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Object.values(rule.actions || {}).flat().length} actions
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Priority {rule.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRuleDeleted(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {days.map(day => {
                    const dayActions = rule.actions?.[day] || [];
                    if (dayActions.length === 0) return null;
                    
                    return (
                      <div key={day}>
                        <h4 className="font-medium text-sm capitalize mb-2">
                          {day.replace('_', ' ')}:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {dayActions.map(actionId => {
                            const action = actions.find(a => a.id === actionId);
                            return action ? (
                              <Badge key={actionId} variant="outline" className="text-xs">
                                {action.display_name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};