import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Home, Eye } from 'lucide-react';
import * as THREE from 'three';

interface Villa3DViewerProps {
  villaId?: string;
  villaName?: string;
}

// Villa Structure Component
const VillaStructure = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = 0.1 * Math.sin(state.clock.elapsedTime * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial color="#90EE90" transparent opacity={0.8} />
      </mesh>

      {/* Villa main structure */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 6]} />
        <meshLambertMaterial color="#F5DEB3" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[6, 2, 4]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Pool */}
      <mesh position={[-8, 0.1, 0]}>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshLambertMaterial color="#1E90FF" />
      </mesh>

      {/* Pool deck */}
      <mesh position={[-8, 0.05, 0]}>
        <boxGeometry args={[8, 0.1, 5]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>

      {/* Garden trees */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        return (
          <mesh key={i} position={[x, 1, z]}>
            <coneGeometry args={[0.5, 2, 8]} />
            <meshLambertMaterial color="#228B22" />
          </mesh>
        );
      })}
    </group>
  );
};

const Villa3DViewer: React.FC<Villa3DViewerProps> = ({ 
  villaId = "sample-villa", 
  villaName = "Sample Villa" 
}) => {
  const controlsRef = useRef<any>();
  const [isLoading, setIsLoading] = useState(false);


  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.5);
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.5);
      controlsRef.current.update();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          3D Villa View - {villaName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="w-full h-96 rounded-lg border bg-muted/50 overflow-hidden">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[15, 10, 15]} />
              <OrbitControls 
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
              />
              
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[20, 20, 20]} 
                intensity={0.8} 
                castShadow 
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              
              {/* Environment */}
              <Environment preset="sunset" background />
              <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={50} blur={2} far={10} />
              
              {/* Villa Structure */}
              <VillaStructure />
            </Canvas>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 rounded-lg px-3 py-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click & drag to rotate • Scroll to zoom
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Villa3DViewer;