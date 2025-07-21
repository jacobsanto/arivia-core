import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CleaningConfigDialog } from "./CleaningConfigDialog";
import { CleaningRulesTable } from "./CleaningRulesTable";

interface CleaningConfig {
  id: string;
  listing_id: string;
  config_name: string;
  is_active: boolean;
  created_at: string;
  rules_count?: number;
}

interface Property {
  id: string;
  title: string;
}

export const CleaningConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<CleaningConfig[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<CleaningConfig | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRulesTable, setShowRulesTable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('guesty_listings')
        .select('id, title')
        .eq('is_deleted', false);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Fetch cleaning configs with rules count
      const { data: configsData, error: configsError } = await supabase
        .from('property_cleaning_configs')
        .select(`
          *,
          rules_count:cleaning_rules(count)
        `);

      if (configsError) throw configsError;
      
      const processedConfigs = configsData?.map(config => ({
        ...config,
        rules_count: config.rules_count?.[0]?.count || 0
      })) || [];
      
      setConfigs(processedConfigs);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load cleaning configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = () => {
    setSelectedConfig(null);
    setShowConfigDialog(true);
  };

  const handleEditConfig = (config: CleaningConfig) => {
    setSelectedConfig(config);
    setShowConfigDialog(true);
  };

  const handleViewRules = (config: CleaningConfig) => {
    setSelectedConfig(config);
    setShowRulesTable(true);
  };

  const getPropertyTitle = (listingId: string) => {
    const property = properties.find(p => p.id === listingId);
    return property?.title || 'Unknown Property';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cleaning Configurations</h1>
            <p className="text-muted-foreground">Manage property-specific cleaning rules and automation</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cleaning Configurations</h1>
          <p className="text-muted-foreground">
            Manage property-specific cleaning rules and automation for when bookings are imported
          </p>
        </div>
        <Button onClick={handleCreateConfig} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => (
          <Card key={config.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{config.config_name}</CardTitle>
                <Badge variant={config.is_active ? "default" : "secondary"}>
                  {config.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getPropertyTitle(config.listing_id)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{config.rules_count} cleaning rules configured</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewRules(config)}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  View Rules
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditConfig(config)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No cleaning configurations found</h3>
                <p className="text-muted-foreground">
                  Create your first cleaning configuration to automate task generation
                </p>
              </div>
              <Button onClick={handleCreateConfig} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CleaningConfigDialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        config={selectedConfig}
        properties={properties}
        onSuccess={fetchData}
      />

      <CleaningRulesTable
        open={showRulesTable}
        onClose={() => setShowRulesTable(false)}
        config={selectedConfig}
        onSuccess={fetchData}
      />
    </div>
  );
};