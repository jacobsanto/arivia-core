import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Clock, Star, Zap, MessageSquare, DollarSign, BarChart3, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationConfig {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  setup_difficulty: string;
  estimated_setup_time: string;
  supported_operations: string[];
  required_fields: any[];
  webhook_events: string[];
}

interface IntegrationMarketplaceProps {
  onSetupIntegration: (config: IntegrationConfig) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'communication': return MessageSquare;
    case 'finance': return DollarSign;
    case 'marketing': return BarChart3;
    case 'automation': return Zap;
    case 'property_management': return Wrench;
    default: return Star;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const IntegrationMarketplace: React.FC<IntegrationMarketplaceProps> = ({ onSetupIntegration }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: integrationConfigs, isLoading } = useQuery({
    queryKey: ['integration-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as IntegrationConfig[];
    }
  });

  const filteredConfigs = integrationConfigs?.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(integrationConfigs?.map(c => c.category) || []));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConfigs.map((config) => {
            const IconComponent = getCategoryIcon(config.category);
            
            return (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {config.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {config.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getDifficultyColor(config.setup_difficulty)}
                    >
                      {config.setup_difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {config.estimated_setup_time}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {config.supported_operations.slice(0, 3).map((op) => (
                        <Badge key={op} variant="outline" className="text-xs">
                          {op.replace('_', ' ')}
                        </Badge>
                      ))}
                      {config.supported_operations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{config.supported_operations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => onSetupIntegration(config)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Setup Integration
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {!isLoading && filteredConfigs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? "No integrations found matching your criteria"
              : "No integrations available"
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationMarketplace;