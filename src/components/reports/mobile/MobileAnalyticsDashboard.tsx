
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Filter } from "lucide-react";
import { ActivityMonitor } from '@/components/analytics/ActivityMonitor';
import { AnalyticsFilters } from '../analytics/AnalyticsFilters';
import { useAnalytics } from '@/contexts/AnalyticsContext';

const MobileAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { selectedProperty } = useAnalytics();
  
  const handleViewFullAnalytics = () => {
    navigate('/reports/analytics');
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <Card className="p-3">
        <AnalyticsFilters />
      </Card>
      
      {/* Compact Analytics Dashboard for Mobile */}
      <AnalyticsDashboard 
        showAllCharts={false} 
        propertyFilter={selectedProperty}
      />
      
      {/* Recent Activity Section */}
      <ActivityMonitor limit={3} />
      
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
