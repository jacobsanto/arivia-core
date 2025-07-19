import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyVirtualTour from '@/components/threed/PropertyVirtualTour';

const VirtualTourPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">3D Virtual Tours</h1>
          <p className="text-muted-foreground mt-2">
            Explore your properties in immersive 3D environments
          </p>
        </div>

        <PropertyVirtualTour />
      </div>
    </div>
  );
};

export default VirtualTourPage;