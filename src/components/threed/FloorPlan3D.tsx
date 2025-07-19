import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, RotateCcw, Bed, Bath, ChefHat, Sofa } from 'lucide-react';

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
}

const FloorPlan3D: React.FC<FloorPlan3DProps> = ({ 
  villaId = "sample-villa", 
  floor = 1 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const rooms: Room[] = [
    { id: '1', name: 'Master Bedroom', type: 'bedroom', position: [3, 0.5, 3], size: [4, 1, 3], color: '#E6F3FF' },
    { id: '2', name: 'Guest Bedroom', type: 'bedroom', position: [-3, 0.5, 3], size: [3, 1, 3], color: '#FFE6F3' },
    { id: '3', name: 'Living Room', type: 'living', position: [0, 0.5, -1], size: [6, 1, 3], color: '#E6FFE6' },
    { id: '4', name: 'Kitchen', type: 'kitchen', position: [3, 0.5, -3], size: [3, 1, 2], color: '#FFF0E6' },
    { id: '5', name: 'Bathroom 1', type: 'bathroom', position: [-3, 0.5, 0], size: [2, 1, 2], color: '#F0F0FF' },
    { id: '6', name: 'Bathroom 2', type: 'bathroom', position: [1, 0.5, 0], size: [1.5, 1, 1.5], color: '#F0F0FF' },
    { id: '7', name: 'Balcony', type: 'balcony', position: [0, 0.5, 5], size: [8, 1, 2], color: '#FFFACD' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera setup - top-down view
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 20, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create floor plan
    createFloorPlan(scene);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi += deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
      }
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (event: MouseEvent) => {
      if (isDragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        const roomId = object.userData.roomId;
        if (roomId) {
          const room = rooms.find(r => r.id === roomId);
          setSelectedRoom(room || null);
        }
      } else {
        setSelectedRoom(null);
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createFloorPlan = (scene: THREE.Scene) => {
    // Base floor
    const floorGeometry = new THREE.PlaneGeometry(12, 12);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xf8f8f8 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create rooms
    rooms.forEach(room => {
      const roomGeometry = new THREE.BoxGeometry(...room.size);
      const roomMaterial = new THREE.MeshLambertMaterial({ 
        color: room.color,
        transparent: true,
        opacity: 0.7 
      });
      const roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
      roomMesh.position.set(...room.position);
      roomMesh.userData.roomId = room.id;
      roomMesh.castShadow = true;
      scene.add(roomMesh);

      // Add room walls
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
      
      // Front and back walls
      const frontWallGeometry = new THREE.BoxGeometry(room.size[0], room.size[1], 0.1);
      const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
      frontWall.position.set(room.position[0], room.position[1], room.position[2] + room.size[2]/2);
      scene.add(frontWall);

      const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
      backWall.position.set(room.position[0], room.position[1], room.position[2] - room.size[2]/2);
      scene.add(backWall);

      // Side walls
      const sideWallGeometry = new THREE.BoxGeometry(0.1, room.size[1], room.size[2]);
      const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      leftWall.position.set(room.position[0] - room.size[0]/2, room.position[1], room.position[2]);
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      rightWall.position.set(room.position[0] + room.size[0]/2, room.position[1], room.position[2]);
      scene.add(rightWall);
    });
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 15, 8);
      cameraRef.current.lookAt(0, 0, 0);
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
              <div 
                ref={mountRef} 
                className="w-full h-96 rounded-lg border bg-muted/50"
                style={{ cursor: 'grab' }}
              />
              
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
                    onClick={() => setSelectedRoom(room)}
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