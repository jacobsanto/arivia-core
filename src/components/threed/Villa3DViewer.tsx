import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Home, Eye } from 'lucide-react';

interface Villa3DViewerProps {
  villaId?: string;
  villaName?: string;
}

const Villa3DViewer: React.FC<Villa3DViewerProps> = ({ 
  villaId = "sample-villa", 
  villaName = "Sample Villa" 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
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
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create villa structure
    createVillaStructure(scene);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

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

    const handleWheel = (event: WheelEvent) => {
      const distance = camera.position.length();
      const newDistance = distance + event.deltaY * 0.01;
      camera.position.normalize().multiplyScalar(Math.max(5, Math.min(50, newDistance)));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

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
      renderer.domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createVillaStructure = (scene: THREE.Scene) => {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x90EE90,
      transparent: true,
      opacity: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Villa main structure
    const villaGeometry = new THREE.BoxGeometry(8, 4, 6);
    const villaMaterial = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
    const villa = new THREE.Mesh(villaGeometry, villaMaterial);
    villa.position.y = 2;
    villa.castShadow = true;
    scene.add(villa);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(6, 2, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Pool
    const poolGeometry = new THREE.BoxGeometry(6, 0.2, 3);
    const poolMaterial = new THREE.MeshLambertMaterial({ color: 0x1E90FF });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.position.set(-8, 0.1, 0);
    scene.add(pool);

    // Pool deck
    const deckGeometry = new THREE.BoxGeometry(8, 0.1, 5);
    const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.set(-8, 0.05, 0);
    scene.add(deck);

    // Garden areas
    for (let i = 0; i < 5; i++) {
      const treeGeometry = new THREE.ConeGeometry(0.5, 2, 8);
      const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      tree.position.set(x, 1, z);
      scene.add(tree);
    }
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(15, 10, 15);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      const distance = cameraRef.current.position.length();
      cameraRef.current.position.normalize().multiplyScalar(Math.max(5, distance - 2));
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      const distance = cameraRef.current.position.length();
      cameraRef.current.position.normalize().multiplyScalar(Math.min(50, distance + 2));
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