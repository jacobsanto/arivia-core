import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
          <CardTitle>Cleaning Rules</CardTitle>
          <Button onClick={onAddRule} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No cleaning rules configured. Add your first rule to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getRuleDescription(rule)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                    disabled={loading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditRule(rule)}
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteRule(rule.id)}
                    disabled={loading}
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