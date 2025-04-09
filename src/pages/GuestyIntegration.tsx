
import { useState } from 'react';
import { GuestyProvider } from '@/contexts/GuestyContext';
import PropertySync from '@/components/guesty/PropertySync';
import BookingSync from '@/components/guesty/BookingSync';
import TaskSync from '@/components/guesty/TaskSync';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowUpDown, Building, Calendar, CheckSquare } from 'lucide-react';

export default function GuestyIntegration() {
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Guesty Integration
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </h1>
          <p className="text-muted-foreground">
            Synchronize data between Arivia Villas and Guesty
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Sync Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Last Sync</p>
              <p className="text-2xl font-bold text-blue-700">Today at 08:32</p>
              <p className="text-xs text-blue-600 mt-1">Completed successfully</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Properties</p>
              <p className="text-2xl font-bold text-green-700">12 <span className="text-sm font-normal">synced</span></p>
              <p className="text-xs text-green-600 mt-1">All properties up to date</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-600 font-medium">Bookings</p>
              <p className="text-2xl font-bold text-amber-700">47 <span className="text-sm font-normal">synced</span></p>
              <p className="text-xs text-amber-600 mt-1">3 new bookings since last sync</p>
            </div>
          </div>
        </div>
      </Card>

      <GuestyProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties">
            <PropertySync />
          </TabsContent>
          
          <TabsContent value="bookings">
            <BookingSync />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TaskSync />
          </TabsContent>
        </Tabs>
      </GuestyProvider>
    </div>
  );
}
