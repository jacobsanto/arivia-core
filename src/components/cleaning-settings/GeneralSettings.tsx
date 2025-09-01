import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="enable-automation">Enable Automated Cleaning Scheduling</Label>
            <p className="text-sm text-muted-foreground">
              Automatically create cleaning tasks based on guest stay length
            </p>
          </div>
          <Switch
            id="enable-automation"
            checked={settings.isAutomatedSchedulingEnabled}
            onCheckedChange={(checked) => onUpdate({ isAutomatedSchedulingEnabled: checked })}
            disabled={loading}
          />
        </div>

        {/* Default Time */}
        <div className="space-y-2">
          <Label htmlFor="default-time">Default time for scheduled cleans</Label>
          <Input
            id="default-time"
            type="time"
            value={settings.defaultCleaningTime}
            onChange={(e) => onUpdate({ defaultCleaningTime: e.target.value })}
            disabled={loading}
            className="w-40"
          />
          <p className="text-sm text-muted-foreground">
            Time of day when automatically scheduled cleaning tasks will be due
          </p>
        </div>
      </CardContent>
    </Card>
  );
};