import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { CleaningRule, ServiceType, FrequencyType, SERVICE_TYPE_LABELS, DAYS_OF_WEEK } from '@/types/cleaningSettings.types';

interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (ruleId: string, updates: Partial<CleaningRule>) => Promise<void>;
  rule?: CleaningRule;
  isLoading: boolean;
}

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  rule,
  isLoading
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    minNights: number;
    maxNights: string;
    serviceType: ServiceType | '';
    frequency: FrequencyType;
    dayOfStay: string;
    dayOfWeek: string;
    isActive: boolean;
  }>({
    name: rule?.name || '',
    minNights: rule?.minNights || 1,
    maxNights: rule?.maxNights?.toString() || '',
    serviceType: rule?.serviceType || '',
    frequency: rule?.frequency || 'once',
    dayOfStay: rule?.dayOfStay?.toString() || '',
    dayOfWeek: rule?.dayOfWeek || '',
    isActive: rule?.isActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceType) return;
    
    const ruleData: Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      minNights: formData.minNights,
      maxNights: formData.maxNights ? parseInt(formData.maxNights) : undefined,
      serviceType: formData.serviceType,
      frequency: formData.frequency,
      dayOfStay: formData.frequency === 'once' ? parseInt(formData.dayOfStay) : undefined,
      dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
      isActive: formData.isActive
    };

    if (rule && onUpdate) {
      await onUpdate(rule.id, ruleData);
    } else {
      await onSave(ruleData);
    }
    
    onClose();
  };

  const isValid = formData.serviceType && 
    (formData.frequency === 'once' ? formData.dayOfStay : formData.dayOfWeek);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Edit Cleaning Rule' : 'Add New Cleaning Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Mid-stay Service for Extended Stays"
            />
          </div>

          {/* Length of Stay Condition */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">For stays between:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-nights">Min nights</Label>
                <Input
                  id="min-nights"
                  type="number"
                  min="1"
                  value={formData.minNights}
                  onChange={(e) => setFormData(prev => ({ ...prev, minNights: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-nights">Max nights (leave blank for "and up")</Label>
                <Input
                  id="max-nights"
                  type="number"
                  min={formData.minNights + 1}
                  value={formData.maxNights}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxNights: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service-type">Schedule this service:</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value as ServiceType }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">How often?</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="frequency-once"
                  name="frequency"
                  value="once"
                  checked={formData.frequency === 'once'}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as FrequencyType }))}
                />
                <Label htmlFor="frequency-once">Once</Label>
              </div>
              
              {formData.frequency === 'once' && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="day-of-stay">On day of stay:</Label>
                  <Input
                    id="day-of-stay"
                    type="number"
                    min="1"
                    value={formData.dayOfStay}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayOfStay: e.target.value }))}
                    placeholder="e.g., 4"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="frequency-weekly"
                  name="frequency"
                  value="weekly"
                  checked={formData.frequency === 'weekly'}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as FrequencyType }))}
                />
                <Label htmlFor="frequency-weekly">Weekly</Label>
              </div>

              {formData.frequency === 'weekly' && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="day-of-week">On day of week:</Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="is-active">Rule is active</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
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
              {rule ? 'Update Rule' : 'Save Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};