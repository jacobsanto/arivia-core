import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { CleaningRule, ServiceType, FrequencyType, SERVICE_TYPE_LABELS, DAYS_OF_WEEK } from '@/types/cleaningSettings.types';

interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (ruleId: string, updates: Partial<CleaningRule>) => void;
  rule?: CleaningRule;
  isLoading: boolean;
}

type FormData = Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'>;

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  rule,
  isLoading
}) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      minNights: 1,
      maxNights: undefined,
      serviceType: 'turnover-clean',
      frequency: 'once',
      dayOfStay: undefined,
      dayOfWeek: undefined,
      isActive: true
    }
  });

  const frequency = watch('frequency');

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        minNights: rule.minNights,
        maxNights: rule.maxNights,
        serviceType: rule.serviceType,
        frequency: rule.frequency,
        dayOfStay: rule.dayOfStay,
        dayOfWeek: rule.dayOfWeek,
        isActive: rule.isActive
      });
    } else {
      reset({
        name: '',
        minNights: 1,
        maxNights: undefined,
        serviceType: 'turnover-clean',
        frequency: 'once',
        dayOfStay: undefined,
        dayOfWeek: undefined,
        isActive: true
      });
    }
  }, [rule, reset]);

  const onSubmit = (data: FormData) => {
    if (rule) {
      onUpdate(rule.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit' : 'Create'} Cleaning Rule</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Mid-stay cleaning for long bookings"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minNights">Min Nights</Label>
              <Input
                id="minNights"
                type="number"
                min={1}
                {...register('minNights', { 
                  required: 'Min nights is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be at least 1' }
                })}
              />
              {errors.minNights && (
                <p className="text-sm text-destructive">{errors.minNights.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxNights">Max Nights (optional)</Label>
              <Input
                id="maxNights"
                type="number"
                min={1}
                {...register('maxNights', { valueAsNumber: true })}
                placeholder="Leave empty for no limit"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={watch('serviceType')}
              onValueChange={(value) => setValue('serviceType', value as ServiceType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value) => setValue('frequency', value as FrequencyType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once during stay</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'once' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfStay">Day of Stay</Label>
              <Input
                id="dayOfStay"
                type="number"
                min={1}
                {...register('dayOfStay', { valueAsNumber: true })}
                placeholder="e.g., 3 for day 3 of stay"
              />
            </div>
          )}

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={watch('dayOfWeek') || 'none'}
                onValueChange={(value) => setValue('dayOfWeek', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select day</SelectItem>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {rule ? 'Update' : 'Create'} Rule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};