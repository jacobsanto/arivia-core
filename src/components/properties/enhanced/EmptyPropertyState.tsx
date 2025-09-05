import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";

interface EmptyPropertyStateProps {
  onCreateProperty?: () => void;
}

export const EmptyPropertyState: React.FC<EmptyPropertyStateProps> = ({ onCreateProperty }) => {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Home className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Properties Found
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          Get started by adding your first property to the system. You can manage villas, apartments, and other rental properties from here.
        </p>
        
        {onCreateProperty && (
          <Button onClick={onCreateProperty} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Property
          </Button>
        )}
      </CardContent>
    </Card>
  );
};