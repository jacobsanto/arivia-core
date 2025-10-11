// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/services/logger';

interface CleaningRule {
  id: string;
  min_nights: number;
  max_nights: number;
  rule_name: string;
  rule_description: string;
  is_active: boolean;
}

interface CleaningRuleDialogProps {
  open: boolean;
  onClose: () => void;
  configId: string;
  rule?: CleaningRule | null;
  onSuccess: () => void;
}

export const CleaningRuleDialog: React.FC<CleaningRuleDialogProps> = ({
  open,
  onClose,
  configId,
  rule,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    rule_name: "",
    rule_description: "",
    min_nights: 1,
    max_nights: 3,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (rule) {
      setFormData({
        rule_name: rule.rule_name,
        rule_description: rule.rule_description || "",
        min_nights: rule.min_nights,
        max_nights: rule.max_nights,
        is_active: rule.is_active
      });
    } else {
      setFormData({
        rule_name: "",
        rule_description: "",
        min_nights: 1,
        max_nights: 3,
        is_active: true
      });
    }
  }, [rule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rule_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a rule name",
        variant: "destructive"
      });
      return;
    }

    if (formData.min_nights < 1 || formData.max_nights < formData.min_nights) {
      toast({
        title: "Validation Error",
        description: "Please enter valid night ranges",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      if (rule) {
        // Update existing rule
        const { error } = await supabase
          .from('cleaning_rules')
          .update({
            rule_name: formData.rule_name.trim(),
            rule_description: formData.rule_description.trim(),
            min_nights: formData.min_nights,
            max_nights: formData.max_nights,
            is_active: formData.is_active
          })
          .eq('id', rule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Cleaning rule updated successfully"
        });
      } else {
        // Create new rule
        const { error } = await supabase
          .from('cleaning_rules')
          .insert({
            config_id: configId,
            rule_name: formData.rule_name.trim(),
            rule_description: formData.rule_description.trim(),
            min_nights: formData.min_nights,
            max_nights: formData.max_nights,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Cleaning rule created successfully"
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      logger.error('Error saving rule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save cleaning rule",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {rule ? "Edit Cleaning Rule" : "Create Cleaning Rule"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rule_name">Rule Name *</Label>
            <Input
              id="rule_name"
              value={formData.rule_name}
              onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
              placeholder="e.g., Short Stay (1-3 nights)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule_description">Description</Label>
            <Textarea
              id="rule_description"
              value={formData.rule_description}
              onChange={(e) => setFormData(prev => ({ ...prev, rule_description: e.target.value }))}
              placeholder="Describe when this rule applies and what it covers"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Booking Duration Conditions
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_nights">Minimum Nights *</Label>
                  <Input
                    id="min_nights"
                    type="number"
                    min="1"
                    value={formData.min_nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_nights: parseInt(e.target.value) || 1 }))}
                    placeholder="e.g., 1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Rule applies when booking is at least this many nights
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_nights">Maximum Nights *</Label>
                  <Input
                    id="max_nights"
                    type="number"
                    min={formData.min_nights}
                    value={formData.max_nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_nights: parseInt(e.target.value) || 999 }))}
                    placeholder="999 for unlimited"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Rule applies when booking is at most this many nights
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-background rounded border">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-sm text-muted-foreground">
                  This rule will apply to bookings between{" "}
                  <span className="font-medium text-foreground">{formData.min_nights}</span> and{" "}
                  <span className="font-medium text-foreground">{formData.max_nights}</span> nights
                  {formData.max_nights === 999 ? " (no upper limit)" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active Rule</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : rule ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};