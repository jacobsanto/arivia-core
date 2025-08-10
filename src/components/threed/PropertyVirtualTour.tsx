import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Home,
  MapPin,
  Eye,
  VolumeX
} from 'lucide-react';
import Villa3DViewer from './Villa3DViewer';
import FloorPlan3D from './FloorPlan3D';

interface TourStop {
  id: string;
  name: string;
  description: string;
  viewpoint: {
    position: [number, number, number];
    target: [number, number, number];
  };
  duration: number;
}

interface PropertyVirtualTourProps {
  propertyId?: string;
  propertyName?: string;
}

const PropertyVirtualTour: React.FC<PropertyVirtualTourProps> = ({
  propertyId = "sample-property",
  propertyName = "Arivia Villa Sample"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStop, setCurrentStop] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState("exterior");

  const tourStops: TourStop[] = [
    {
      id: '1',
      name: 'Villa Exterior',
      description: 'Welcome to this stunning villa with modern architecture and beautiful landscaping.',
      viewpoint: { position: [15, 10, 15], target: [0, 0, 0] },
      duration: 8
    },
    {
      id: '2',
      name: 'Pool Area',
      description: 'Enjoy the private swimming pool with deck area, perfect for relaxation.',
      viewpoint: { position: [-12, 8, 0], target: [-8, 0, 0] },
      duration: 6
    },
    {
      id: '3',
      name: 'Garden View',
      description: 'Beautiful landscaped gardens surrounding the property.',
      viewpoint: { position: [0, 12, 20], target: [0, 0, 0] },
      duration: 5
    },
    {
      id: '4',
      name: 'Aerial Overview',
      description: 'Bird\'s eye view of the entire property and surroundings.',
      viewpoint: { position: [0, 25, 0], target: [0, 0, 0] },
      duration: 7
    }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextStop = () => {
    setCurrentStop((prev) => (prev + 1) % tourStops.length);
  };

  const handlePrevStop = () => {
    setCurrentStop((prev) => (prev - 1 + tourStops.length) % tourStops.length);
  };

  const handleStopSelect = (index: number) => {
    setCurrentStop(index);
  };

  const currentTourStop = tourStops[currentStop];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Virtual Property Tour - {propertyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="exterior" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Exterior View
              </TabsTrigger>
              <TabsTrigger value="floorplan" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Floor Plan
              </TabsTrigger>
              <TabsTrigger value="tour" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Guided Tour
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exterior">
              <Villa3DViewer villaId={propertyId} villaName={propertyName} />
            </TabsContent>

            <TabsContent value="floorplan">
              <FloorPlan3D villaId={propertyId} floor={1} />
            </TabsContent>

            <TabsContent value="tour">
              <div className="space-y-4">
                <div className="relative">
                  <Villa3DViewer villaId={propertyId} villaName={propertyName} />
                  
                  {/* Tour Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-lg border p-4 min-w-80">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Button variant="outline" size="sm" onClick={handlePrevStop}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={isPlaying ? "secondary" : "default"} 
                        size="sm" 
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextStop}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-sm mb-1">{currentTourStop.name}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Stop {currentStop + 1} of {tourStops.length}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-1000"
                          style={{ width: `${((currentStop + 1) / tourStops.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tour Description */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{currentTourStop.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {currentTourStop.description}
                        </p>
                        <Badge variant="secondary">
                          Duration: {currentTourStop.duration}s
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tour Stops Navigation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tour Stops</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tourStops.map((stop, index) => (
                        <div
                          key={stop.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            currentStop === index 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleStopSelect(index)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{stop.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {stop.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyVirtualTour;