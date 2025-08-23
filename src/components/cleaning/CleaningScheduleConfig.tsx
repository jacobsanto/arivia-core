import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Calendar, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

export const CleaningScheduleConfig: React.FC = () => {
  const [scheduleRules, setScheduleRules] = useState([
    {
      id: 1,
      name: 'Short Stay (1-3 nights)',
      duration: '1-3 nights',
      checkInCleaning: 'Full Deep Clean',
      midStayCleaning: 'None',
      checkOutPrep: 'Standard Turnover',
      isActive: true,
      estimatedTime: 120
    },
    {
      id: 2,
      name: 'Medium Stay (4-7 nights)',
      duration: '4-7 nights',
      checkInCleaning: 'Full Deep Clean',
      midStayCleaning: 'Standard Clean (Mid-stay)',
      checkOutPrep: 'Standard Turnover',
      isActive: true,
      estimatedTime: 180
    },
    {
      id: 3,
      name: 'Extended Stay (7+ nights)',
      duration: '7+ nights',
      checkInCleaning: 'Full Deep Clean',
      midStayCleaning: 'Standard + Linen Change (Every 3 days)',
      checkOutPrep: 'Deep Turnover',
      isActive: true,
      estimatedTime: 240
    }
  ]);

  const cleaningTypes = [
    {
      name: 'Full Deep Clean',
      description: 'Complete cleaning with sanitization, fresh linens, restocking',
      duration: 120,
      tasks: ['Deep bathroom clean', 'Kitchen sanitization', 'Floor cleaning', 'Linen change', 'Amenity restocking']
    },
    {
      name: 'Standard Clean',
      description: 'General cleaning and maintenance',
      duration: 60,
      tasks: ['Bathroom refresh', 'Kitchen clean', 'Vacuum', 'Trash removal']
    },
    {
      name: 'Linen & Towel Change',
      description: 'Fresh linens with light cleaning',
      duration: 30,
      tasks: ['Change bed linens', 'Replace towels', 'Bathroom quick clean']
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">Schedule Rules</TabsTrigger>
          <TabsTrigger value="templates">Cleaning Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Arivia Cleaning Rules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Arivia Cleaning Schedule Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic cleaning schedules based on guest stay duration
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {scheduleRules.map((rule) => (
                <Card key={rule.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {rule.name}
                          {rule.isActive && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {rule.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            ~{rule.estimatedTime} min total
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Switch checked={rule.isActive} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-blue-600">Check-in Preparation</Label>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium text-sm">{rule.checkInCleaning}</p>
                          <p className="text-xs text-muted-foreground">Before guest arrival</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-600">During Stay</Label>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="font-medium text-sm">{rule.midStayCleaning}</p>
                          <p className="text-xs text-muted-foreground">Mid-stay service</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-600">Check-out</Label>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="font-medium text-sm">{rule.checkOutPrep}</p>
                          <p className="text-xs text-muted-foreground">After guest departure</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Cleaning Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Standardized cleaning checklists and procedures
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cleaningTypes.map((type, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {type.name}
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {type.duration}min
                      </Badge>
                    </CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Included Tasks:</Label>
                      <div className="space-y-2">
                        {type.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};