import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { CleaningRule } from '@/types/cleaningSettings.types';

interface RulesListProps {
  rules: CleaningRule[];
  onAddRule: () => void;
  onEditRule: (rule: CleaningRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, isActive: boolean) => void;
  getRuleDescription: (rule: CleaningRule) => string;
  loading: boolean;
}

export const RulesList: React.FC<RulesListProps> = ({
  rules,
  onAddRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  getRuleDescription,
  loading
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Length of Stay Rules</CardTitle>
          <Button onClick={onAddRule} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No cleaning rules configured yet.</p>
            <p className="text-sm">Create your first rule to start automating cleaning schedules.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge 
                      variant={rule.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getRuleDescription(rule)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                    disabled={loading}
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRule(rule)}
                    disabled={loading}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRule(rule.id)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};