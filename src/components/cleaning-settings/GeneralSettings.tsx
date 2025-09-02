import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CleaningSettings } from '@/types/cleaningSettings.types';

interface GeneralSettingsProps {
  settings: Pick<CleaningSettings, 'isAutomatedSchedulingEnabled' | 'defaultCleaningTime'>;
  onUpdate: (updates: Partial<Pick<CleaningSettings, 'isAutomatedSchedulingEnabled' | 'defaultCleaningTime'>>) => void;
  loading: boolean;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
  loading
}) => {
  const handleAutomationToggle = (enabled: boolean) => {
    onUpdate({ isAutomatedSchedulingEnabled: enabled });
  };

  const handleTimeChange = (time: string) => {
    onUpdate({ defaultCleaningTime: time });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="automation">Automated Scheduling</Label>
            <p className="text-sm text-muted-foreground">
              Automatically create cleaning tasks based on rules
            </p>
          </div>
          <Switch
            id="automation"
            checked={settings.isAutomatedSchedulingEnabled}
            onCheckedChange={handleAutomationToggle}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-time">Default Cleaning Time</Label>
          <Input
            id="default-time"
            type="time"
            value={settings.defaultCleaningTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={loading}
            className="w-32"
          />
          <p className="text-sm text-muted-foreground">
            Default time for scheduled cleaning tasks
          </p>
        </div>
      </CardContent>
    </Card>
  );
};