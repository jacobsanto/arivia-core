// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CleaningConfig {
  id: string;
  listing_id: string;
  config_name: string;
  is_active: boolean;
}

interface Property {
  id: string;
  title: string;
}

interface CleaningConfigDialogProps {
  open: boolean;
  onClose: () => void;
  config?: CleaningConfig | null;
  properties: Property[];
  onSuccess: () => void;
}

export const CleaningConfigDialog: React.FC<CleaningConfigDialogProps> = ({
  open,
  onClose,
  config,
  properties,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    config_name: "",
    listing_id: "",
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (config) {
      setFormData({
        config_name: config.config_name,
        listing_id: config.listing_id,
        is_active: config.is_active
      });
    } else {
      setFormData({
        config_name: "",
        listing_id: "",
        is_active: true
      });
    }
  }, [config, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.config_name.trim() || !formData.listing_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      if (config) {
        // Update existing config
        const { error } = await supabase
          .from('property_cleaning_configs')
          .update({
            config_name: formData.config_name.trim(),
            listing_id: formData.listing_id,
            is_active: formData.is_active
          })
          .eq('id', config.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Cleaning configuration updated successfully"
        });
      } else {
        // Create new config
        const { error } = await supabase
          .from('property_cleaning_configs')
          .insert({
            config_name: formData.config_name.trim(),
            listing_id: formData.listing_id,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Cleaning configuration created successfully"
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save cleaning configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {config ? "Edit Cleaning Configuration" : "Create Cleaning Configuration"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="config_name">Configuration Name *</Label>
            <Input
              id="config_name"
              value={formData.config_name}
              onChange={(e) => setFormData(prev => ({ ...prev, config_name: e.target.value }))}
              placeholder="e.g., Luxury Villa Standard"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listing_id">Property *</Label>
            <Select
              value={formData.listing_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, listing_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active Configuration</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : config ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};