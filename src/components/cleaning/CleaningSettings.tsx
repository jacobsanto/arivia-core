import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Plus, Calendar, Users, Timer, MapPin } from 'lucide-react';
import { CleaningScheduleConfig } from './CleaningScheduleConfig';
import { CleaningTeamManagement } from './CleaningTeamManagement';
import { CleaningOverview } from './CleaningOverview';

export const CleaningSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            Cleaning Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure cleaning schedules, team assignments, and automation for all Arivia properties
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            System Active
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Quick Setup
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Rules
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team & Zones
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CleaningOverview />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Schedule Configuration</CardTitle>
              <CardDescription>
                Set up automatic cleaning schedules based on booking patterns and stay duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CleaningScheduleConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management & Zone Assignment</CardTitle>
              <CardDescription>
                Manage cleaning staff and assign them to specific villa zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CleaningTeamManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure smart automation features for efficient cleaning operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Advanced Automation</h3>
                  <p className="text-muted-foreground mb-4">
                    Smart scheduling and task automation features
                  </p>
                  <Button variant="outline">
                    Configure Automation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};