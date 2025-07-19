import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, RotateCcw, Bed, Bath, ChefHat, Sofa } from 'lucide-react';
import * as THREE from 'three';

interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'dining' | 'balcony';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

interface FloorPlan3DProps {
  villaId?: string;
  floor?: number;
  onRoomSelect?: (room: Room | null) => void;
}

// Room Component
const RoomMesh: React.FC<{ room: Room; isSelected: boolean; onClick: () => void }> = ({ 
  room, 
  isSelected, 
  onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = room.position[1] + 0.05 * Math.sin(state.clock.elapsedTime * 3);
    } else if (meshRef.current) {
      meshRef.current.position.y = room.position[1];
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group>
      {/* Room floor */}
      <mesh 
        ref={meshRef}
        position={room.position}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={room.size} />
        <meshLambertMaterial 
          color={room.color} 
          transparent 
          opacity={isSelected ? 0.9 : 0.7}
          emissive={isSelected ? "#222" : "#000"}
        />
      </mesh>

      {/* Room walls */}
      {/* Front and back walls */}
      <mesh position={[room.position[0], room.position[1], room.position[2] + room.size[2]/2]}>
        <boxGeometry args={[room.size[0], room.size[1], 0.1]} />
        <meshLambertMaterial color="#cccccc" />
      </mesh>
      <mesh position={[room.position[0], room.position[1], room.position[2] - room.size[2]/2]}>
        <boxGeometry args={[room.size[0], room.size[1], 0.1]} />
        <meshLambertMaterial color="#cccccc" />
      </mesh>

      {/* Side walls */}
      <mesh position={[room.position[0] - room.size[0]/2, room.position[1], room.position[2]]}>
        <boxGeometry args={[0.1, room.size[1], room.size[2]]} />
        <meshLambertMaterial color="#cccccc" />
      </mesh>
      <mesh position={[room.position[0] + room.size[0]/2, room.position[1], room.position[2]]}>
        <boxGeometry args={[0.1, room.size[1], room.size[2]]} />
        <meshLambertMaterial color="#cccccc" />
      </mesh>
    </group>
  );
};

// Floor Plan Scene Component
const FloorPlanScene: React.FC<{ 
  rooms: Room[]; 
  selectedRoom: Room | null; 
  onRoomSelect: (room: Room | null) => void;
}> = ({ rooms, selectedRoom, onRoomSelect }) => {
  return (
    <>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshLambertMaterial color="#f8f8f8" />
      </mesh>

      {/* Rooms */}
      {rooms.map(room => (
        <RoomMesh 
          key={room.id}
          room={room}
          isSelected={selectedRoom?.id === room.id}
          onClick={() => onRoomSelect(room)}
        />
      ))}
    </>
  );
};

const FloorPlan3D: React.FC<FloorPlan3DProps> = ({ 
  villaId = "sample-villa", 
  floor = 1,
  onRoomSelect
}) => {
  const controlsRef = useRef<any>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rooms: Room[] = [
    { id: '1', name: 'Master Bedroom', type: 'bedroom', position: [3, 0.5, 3], size: [4, 1, 3], color: '#E6F3FF' },
    { id: '2', name: 'Guest Bedroom', type: 'bedroom', position: [-3, 0.5, 3], size: [3, 1, 3], color: '#FFE6F3' },
    { id: '3', name: 'Living Room', type: 'living', position: [0, 0.5, -1], size: [6, 1, 3], color: '#E6FFE6' },
    { id: '4', name: 'Kitchen', type: 'kitchen', position: [3, 0.5, -3], size: [3, 1, 2], color: '#FFF0E6' },
    { id: '5', name: 'Bathroom 1', type: 'bathroom', position: [-3, 0.5, 0], size: [2, 1, 2], color: '#F0F0FF' },
    { id: '6', name: 'Bathroom 2', type: 'bathroom', position: [1, 0.5, 0], size: [1.5, 1, 1.5], color: '#F0F0FF' },
    { id: '7', name: 'Balcony', type: 'balcony', position: [0, 0.5, 5], size: [8, 1, 2], color: '#FFFACD' },
  ];

  const handleRoomSelect = (room: Room | null) => {
    setSelectedRoom(room);
    onRoomSelect?.(room);
  };

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const getRoomIcon = (type: Room['type']) => {
    switch (type) {
      case 'bedroom': return <Bed className="h-4 w-4" />;
      case 'bathroom': return <Bath className="h-4 w-4" />;
      case 'kitchen': return <ChefHat className="h-4 w-4" />;
      case 'living': case 'dining': return <Sofa className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          3D Floor Plan - Floor {floor}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="w-full h-96 rounded-lg border bg-muted/50 overflow-hidden">
                <Canvas shadows>
                  <PerspectiveCamera makeDefault position={[0, 15, 8]} />
                  <OrbitControls 
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2}
                  />
                  
                  {/* Lighting */}
                  <ambientLight intensity={0.6} />
                  <directionalLight 
                    position={[0, 20, 0]} 
                    intensity={0.8} 
                    castShadow 
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                  />
                  
                  {/* Contact shadows for better depth perception */}
                  <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={15} blur={2} far={5} />
                  
                  {/* Floor Plan Scene */}
                  <FloorPlanScene 
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onRoomSelect={handleRoomSelect}
                  />
                </Canvas>
              </div>
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              <div className="absolute top-4 right-4">
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 rounded-lg px-3 py-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click rooms to inspect • Drag to rotate
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Rooms ({rooms.length})</h4>
              <div className="space-y-2">
                {rooms.map(room => (
                  <div 
                    key={room.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoom?.id === room.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getRoomIcon(room.type)}
                      <span className="font-medium text-sm">{room.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {room.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {selectedRoom && (
              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-medium mb-2">Room Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getRoomIcon(selectedRoom.type)}
                    <span className="font-medium">{selectedRoom.name}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Type: <span className="capitalize">{selectedRoom.type}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Dimensions: {selectedRoom.size[0]}m × {selectedRoom.size[2]}m
                  </div>
                  <div className="text-muted-foreground">
                    Area: {(selectedRoom.size[0] * selectedRoom.size[2]).toFixed(1)}m²
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorPlan3D;