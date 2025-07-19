import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, MapPin, Camera, Mic, User, Calendar } from 'lucide-react';

export const MobileTaskInterface = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const mobileTasks = [
    {
      id: '1',
      title: 'Standard Cleaning - Villa Aurora',
      room: 'Room 3',
      priority: 'normal',
      dueTime: '14:00',
      estimatedDuration: '45 min',
      assignedTo: 'Maria Santos',
      status: 'in_progress',
      checklist: [
        { id: 1, item: 'Change bed linens', completed: true },
        { id: 2, item: 'Clean bathroom', completed: true },
        { id: 3, item: 'Vacuum floors', completed: false },
        { id: 4, item: 'Restock amenities', completed: false },
        { id: 5, item: 'Final inspection', completed: false }
      ],
      location: { lat: 37.4419, lng: 25.3267 },
      photos: []
    },
    {
      id: '2',
      title: 'Maintenance Check - Villa Serenity',
      room: 'Kitchen',
      priority: 'high',
      dueTime: '15:30',
      estimatedDuration: '30 min',
      assignedTo: 'Dimitris Kostas',
      status: 'pending',
      checklist: [
        { id: 1, item: 'Check dishwasher operation', completed: false },
        { id: 2, item: 'Inspect sink faucet', completed: false },
        { id: 3, item: 'Test kitchen appliances', completed: false },
        { id: 4, item: 'Report any issues', completed: false }
      ],
      location: { lat: 37.4429, lng: 25.3277 },
      photos: []
    },
    {
      id: '3',
      title: 'Inventory Restock - Central Storage',
      room: 'Storage Room A',
      priority: 'normal',
      dueTime: '16:00',
      estimatedDuration: '20 min',
      assignedTo: 'Elena Papadopoulos',
      status: 'completed',
      checklist: [
        { id: 1, item: 'Count towel inventory', completed: true },
        { id: 2, item: 'Restock cleaning supplies', completed: true },
        { id: 3, item: 'Update inventory log', completed: true }
      ],
      location: { lat: 37.4439, lng: 25.3287 },
      photos: ['storage_1.jpg', 'inventory_count.jpg']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress': return 'text-warning';
      case 'pending': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const startTask = (taskId: string) => {
    console.log('Starting task:', taskId);
  };

  const completeTask = (taskId: string) => {
    console.log('Completing task:', taskId);
  };

  const addPhoto = (taskId: string) => {
    console.log('Adding photo to task:', taskId);
  };

  const addVoiceNote = (taskId: string) => {
    console.log('Adding voice note to task:', taskId);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Task Simulator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 Mobile Task Interface Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 text-white" style={{ fontFamily: 'system-ui' }}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                  A
                </div>
                <span className="font-medium">Arivia Tasks</span>
              </div>
              <div className="text-sm text-gray-300">14:25</div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {mobileTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTask === task.id ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-800 border-gray-600'
                  }`}
                  onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status).replace('text-', 'bg-')}`} />
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        task.priority === 'normal' ? 'bg-gray-500/20 text-gray-300' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {task.room}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.dueTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignedTo.split(' ')[0]}
                    </div>
                  </div>

                  {/* Expanded Task Details */}
                  {selectedTask === task.id && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="space-y-3">
                        {/* Checklist */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Checklist</h4>
                          <div className="space-y-2">
                            {task.checklist.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  item.completed ? 'bg-green-500 border-green-500' : 'border-gray-500'
                                }`}>
                                  {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                                </div>
                                <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                                  {item.item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          {task.status === 'pending' && (
                            <button 
                              onClick={() => startTask(task.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium"
                            >
                              Start Task
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button 
                              onClick={() => completeTask(task.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium"
                            >
                              Complete
                            </button>
                          )}
                          <button 
                            onClick={() => addPhoto(task.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => addVoiceNote(task.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
                          >
                            <Mic className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Photos */}
                        {task.photos.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Photos ({task.photos.length})</h4>
                            <div className="flex gap-2">
                              {task.photos.map((photo, index) => (
                                <div key={index} className="w-16 h-16 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                                  <Camera className="h-6 w-6 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-around mt-6 pt-4 border-t border-gray-700">
              <button className="flex flex-col items-center gap-1 text-blue-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-xs">Tasks</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400">
                <MapPin className="h-5 w-5" />
                <span className="text-xs">Map</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400">
                <Camera className="h-5 w-5" />
                <span className="text-xs">Photos</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Schedule</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              Task Management Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-medium">Interactive Checklists</h4>
                  <p className="text-sm text-muted-foreground">Tap to complete task items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Camera className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Photo Documentation</h4>
                  <p className="text-sm text-muted-foreground">Capture and attach photos to tasks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mic className="h-5 w-5 text-info" />
                <div>
                  <h4 className="font-medium">Voice Notes</h4>
                  <p className="text-sm text-muted-foreground">Quick voice memos for task details</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MapPin className="h-5 w-5 text-warning" />
                <div>
                  <h4 className="font-medium">GPS Location</h4>
                  <p className="text-sm text-muted-foreground">Automatic location tracking</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-primary">2.5</div>
                <div className="text-sm text-muted-foreground">Avg Task Time (hrs)</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-success">94%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-info">3.2</div>
                <div className="text-sm text-muted-foreground">Photos per Task</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-warning">89%</div>
                <div className="text-sm text-muted-foreground">GPS Accuracy</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Task Efficiency</span>
                <span>92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};