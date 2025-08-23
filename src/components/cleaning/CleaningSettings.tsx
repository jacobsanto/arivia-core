import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CleaningScheduleConfig } from './CleaningScheduleConfig';
import { CleaningTeamManagement } from './CleaningTeamManagement';

export const CleaningSettings: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cleaning Settings</h1>
        <p className="text-muted-foreground">Configure cleaning rules, automation, schedules, and team management</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Schedule Config</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <CleaningScheduleConfig />
        </TabsContent>
        
        <TabsContent value="team">
          <CleaningTeamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};