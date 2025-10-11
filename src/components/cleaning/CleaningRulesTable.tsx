import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CleaningRuleDialog } from "./CleaningRuleDialog";
import { logger } from '@/services/logger';

interface CleaningConfig {
  id: string;
  config_name: string;
  listing_id: string;
}

interface CleaningRule {
  id: string;
  min_nights: number;
  max_nights: number;
  rule_name: string;
  rule_description: string;
  is_active: boolean;
  schedules_count?: number;
}

interface CleaningRulesTableProps {
  open: boolean;
  onClose: () => void;
  config: CleaningConfig | null;
  onSuccess: () => void;
}

export const CleaningRulesTable: React.FC<CleaningRulesTableProps> = ({
  open,
  onClose,
  config,
  onSuccess
}) => {
  const [rules, setRules] = useState<CleaningRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CleaningRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && config) {
      fetchRules();
    }
  }, [open, config]);

  const fetchRules = async () => {
    if (!config) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cleaning_rules')
        .select(`
          *,
          schedules_count:cleaning_schedules(count)
        `)
        .eq('config_id', config.id)
        .order('min_nights');

      if (error) throw error;

      const processedRules = data?.map(rule => ({
        ...rule,
        schedules_count: rule.schedules_count?.[0]?.count || 0
      })) || [];

      setRules(processedRules);
    } catch (error: any) {
      logger.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: "Failed to load cleaning rules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setShowRuleDialog(true);
  };

  const handleEditRule = (rule: CleaningRule) => {
    setSelectedRule(rule);
    setShowRuleDialog(true);
  };

  const getNightsDisplay = (rule: CleaningRule) => {
    if (rule.max_nights >= 999) {
      return `${rule.min_nights}+ nights`;
    }
    if (rule.min_nights === rule.max_nights) {
      return `${rule.min_nights} night${rule.min_nights > 1 ? 's' : ''}`;
    }
    return `${rule.min_nights}-${rule.max_nights} nights`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cleaning Rules for {config?.config_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Configure cleaning schedules based on booking duration
              </p>
              <Button onClick={handleCreateRule} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : rules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Schedules</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{rule.rule_name}</div>
                          {rule.rule_description && (
                            <div className="text-sm text-muted-foreground">
                              {rule.rule_description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getNightsDisplay(rule)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{rule.schedules_count} schedules</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 space-y-3">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-medium">No cleaning rules configured</h3>
                  <p className="text-sm text-muted-foreground">
                    Create rules to define cleaning schedules for different stay durations
                  </p>
                </div>
                <Button onClick={handleCreateRule} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Rule
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <CleaningRuleDialog
          open={showRuleDialog}
          onClose={() => setShowRuleDialog(false)}
          configId={config?.id || ""}
          rule={selectedRule}
          onSuccess={() => {
            fetchRules();
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};