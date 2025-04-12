
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from "lucide-react";

const MobileAnalyticsDashboard = () => {
  const navigate = useNavigate();
  
  const handleViewFullAnalytics = () => {
    navigate('/reports/analytics');
  };

  return (
    <div className="space-y-4">
      {/* Compact Analytics Dashboard for Mobile */}
      <AnalyticsDashboard showAllCharts={false} />
      
      {/* View More Button */}
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleViewFullAnalytics}
      >
        <ExternalLink className="h-4 w-4" />
        View Detailed Analytics
      </Button>
    </div>
  );
};

export default MobileAnalyticsDashboard;
