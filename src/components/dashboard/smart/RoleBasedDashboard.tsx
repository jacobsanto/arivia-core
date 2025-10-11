import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Plus, 
  GripVertical, 
  X, 
  PlusCircle,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { logger } from '@/services/logger';

// Import all widget components
import { KpiSummaryWidget } from "../widgets/KpiSummaryWidget";
import { PortfolioReadinessWidget } from "../widgets/PortfolioReadinessWidget";
import { OccupancyOverviewWidget } from "../widgets/OccupancyOverviewWidget";
import { MyTasksWidget } from "../widgets/MyTasksWidget";
import { ActionItemsWidget } from "../widgets/ActionItemsWidget";
import { NotificationTestButton } from "@/components/notifications/NotificationTestButton";
import { RecentActivityWidget } from "../widgets/RecentActivityWidget";
import { MaintenanceHotspotsWidget } from "../widgets/MaintenanceHotspotsWidget";
import { RecentDamageReportsWidget } from "../widgets/RecentDamageReportsWidget";
import { TeamWorkloadWidget } from "../widgets/TeamWorkloadWidget";
import { TeamDirectoryWidget } from "../widgets/TeamDirectoryWidget";

// Widget configuration with role-based access
export interface WidgetConfig {
  id: string;
  name: string;
  component: React.ComponentType;
  allowedRoles: string[];
  category: 'kpi' | 'actionable' | 'trends' | 'team';
  defaultSize?: 'small' | 'medium' | 'large';
  currentSize?: 'small' | 'medium' | 'large';
}

const ALL_WIDGETS: WidgetConfig[] = [
  // High-Level KPIs
  {
    id: 'kpi-summary',
    name: 'KPI Summary',
    component: KpiSummaryWidget,
    allowedRoles: ['administrator', 'property_manager', 'superadmin'],
    category: 'kpi',
    defaultSize: 'large'
  },
  {
    id: 'portfolio-readiness',
    name: 'Portfolio Readiness',
    component: PortfolioReadinessWidget,
    allowedRoles: ['administrator', 'property_manager', 'superadmin'],
    category: 'kpi',
    defaultSize: 'medium'
  },
  {
    id: 'occupancy-overview',
    name: 'Occupancy Overview',
    component: OccupancyOverviewWidget,
    allowedRoles: ['administrator', 'property_manager', 'superadmin'],
    category: 'kpi',
    defaultSize: 'medium'
  },
  
  // Actionable Feeds
  {
    id: 'my-tasks',
    name: 'My Tasks',
    component: MyTasksWidget,
    allowedRoles: ['housekeeping_staff', 'maintenance_staff', 'property_manager', 'administrator', 'superadmin'],
    category: 'actionable',
    defaultSize: 'large'
  },
  {
    id: 'action-items',
    name: 'Action Items',
    component: ActionItemsWidget,
    allowedRoles: ['property_manager', 'administrator', 'superadmin'],
    category: 'actionable',
    defaultSize: 'medium'
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    component: RecentActivityWidget,
    allowedRoles: ['property_manager', 'administrator', 'superadmin'],
    category: 'actionable',
    defaultSize: 'medium'
  },
  
  // Trend & Problem Spotting
  {
    id: 'maintenance-hotspots',
    name: 'Maintenance Hotspots',
    component: MaintenanceHotspotsWidget,
    allowedRoles: ['maintenance_staff', 'property_manager', 'administrator', 'superadmin'],
    category: 'trends',
    defaultSize: 'medium'
  },
  {
    id: 'recent-damage-reports',
    name: 'Recent Damage Reports',
    component: RecentDamageReportsWidget,
    allowedRoles: ['property_manager', 'administrator', 'superadmin'],
    category: 'trends',
    defaultSize: 'medium'
  },
  
  // Team & Resource Management
  {
    id: 'team-workload',
    name: 'Team Workload',
    component: TeamWorkloadWidget,
    allowedRoles: ['property_manager', 'administrator', 'superadmin'],
    category: 'team',
    defaultSize: 'large'
  },
  {
    id: 'team-directory',
    name: 'Team Directory',
    component: TeamDirectoryWidget,
    allowedRoles: ['property_manager', 'administrator', 'superadmin'],
    category: 'team',
    defaultSize: 'medium'
  }
];

// Default layouts by role
const DEFAULT_LAYOUTS: Record<string, string[]> = {
  administrator: [
    'kpi-summary',
    'portfolio-readiness', 
    'occupancy-overview',
    'action-items',
    'team-workload',
    'maintenance-hotspots',
    'recent-activity'
  ],
  property_manager: [
    'kpi-summary',
    'my-tasks',
    'action-items',
    'portfolio-readiness',
    'team-workload',
    'recent-damage-reports'
  ],
  housekeeping_staff: [
    'my-tasks',
    'recent-activity',
    'portfolio-readiness'
  ],
  maintenance_staff: [
    'my-tasks',
    'maintenance-hotspots',
    'recent-activity'
  ],
  superadmin: [
    'kpi-summary',
    'portfolio-readiness',
    'occupancy-overview',
    'action-items',
    'team-workload',
    'team-directory',
    'maintenance-hotspots',
    'recent-damage-reports'
  ]
};

const STORAGE_KEY = 'arivia_dashboard_layout';

export const RoleBasedDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [userWidgets, setUserWidgets] = useState<string[]>([]);
  const [originalLayout, setOriginalLayout] = useState<string[]>([]);
  const [widgetSizes, setWidgetSizes] = useState<Record<string, 'small' | 'medium' | 'large'>>({});

  // Get widgets available to current user
  const availableWidgets = useMemo(() => {
    if (!user) return [];
    return ALL_WIDGETS.filter(widget => 
      widget.allowedRoles.includes(user.role)
    );
  }, [user]);

  // Get widgets currently visible to user
  const visibleWidgets = useMemo(() => {
    return userWidgets.map(widgetId => 
      availableWidgets.find(widget => widget.id === widgetId)
    ).filter(Boolean) as WidgetConfig[];
  }, [userWidgets, availableWidgets]);

  // Get widgets that can be added (not currently visible)
  const addableWidgets = useMemo(() => {
    return availableWidgets.filter(widget => 
      !userWidgets.includes(widget.id)
    );
  }, [availableWidgets, userWidgets]);

  // Load user's saved layout or default
  useEffect(() => {
    if (!user) return;

    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        const userLayout = parsed[user.id];
        if (userLayout) {
          // Handle both old format (array) and new format (object)
          if (Array.isArray(userLayout)) {
            setUserWidgets(userLayout);
          } else if (userLayout.widgets && Array.isArray(userLayout.widgets)) {
            setUserWidgets(userLayout.widgets);
            setWidgetSizes(userLayout.sizes || {});
          }
          return;
        }
      } catch (error) {
        logger.warn('Failed to parse saved dashboard layout:', error);
      }
    }

    // Use default layout for role
    const defaultLayout = DEFAULT_LAYOUTS[user.role] || DEFAULT_LAYOUTS.housekeeping_staff;
    setUserWidgets(defaultLayout);
  }, [user]);

  const enterEditMode = () => {
    setOriginalLayout([...userWidgets]);
    setIsEditMode(true);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setOriginalLayout([]);
  };

  const cancelChanges = () => {
    setUserWidgets([...originalLayout]);
    exitEditMode();
  };

  const saveLayout = () => {
    if (!user) return;

      try {
        const existingLayouts = localStorage.getItem(STORAGE_KEY);
        const layouts = existingLayouts ? JSON.parse(existingLayouts) : {};
        layouts[user.id] = {
          widgets: userWidgets,
          sizes: widgetSizes
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
        
        exitEditMode();
      } catch (error) {
        logger.error('Failed to save dashboard layout:', error);
      }
  };

  const addWidget = (widgetId: string) => {
    setUserWidgets(prev => [...prev, widgetId]);
  };

  const removeWidget = (widgetId: string) => {
    setUserWidgets(prev => prev.filter(id => id !== widgetId));
  };

  const getGridClass = (widget: WidgetConfig) => {
    const currentSize = widgetSizes[widget.id] || widget.defaultSize;
    switch (currentSize) {
      case 'large':
        return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-3';
      case 'medium':
        return 'col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2';
      case 'small':
      default:
        return 'col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1';
    }
  };

  const resizeWidget = (widgetId: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgetSizes(prev => ({
      ...prev,
      [widgetId]: newSize
    }));
  };

  const getNextSize = (currentSize: 'small' | 'medium' | 'large') => {
    switch (currentSize) {
      case 'small': return 'medium';
      case 'medium': return 'large';
      case 'large': return 'small';
      default: return 'medium';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user.role === 'administrator' ? 'Operations Command Center' :
             user.role === 'property_manager' ? 'Property Management Hub' :
             'My Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'administrator' ? 'Strategic overview and team coordination' :
             user.role === 'property_manager' ? 'Manage properties and oversee operations' :
             `Welcome back, ${user.name}. Here are your personalized insights.`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={cancelChanges}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveLayout}>
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            </>
          ) : (
            <>
              {addableWidgets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={isEditMode ? '' : 'hidden'}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Widget
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {addableWidgets.map((widget) => (
                      <DropdownMenuItem 
                        key={widget.id}
                        onClick={() => addWidget(widget.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {widget.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button variant="outline" onClick={enterEditMode}>
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {visibleWidgets.map((widget) => {
          const WidgetComponent = widget.component;
          
          return (
            <div 
              key={widget.id}
              className={`${getGridClass(widget)} ${isEditMode ? 'ring-2 ring-primary/20 rounded-lg' : ''}`}
            >
              <div className="relative h-full">
                {isEditMode && (
                  <>
                    {/* Drag Handle */}
                    <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground rounded-full p-1 cursor-move">
                      <GripVertical className="h-3 w-3" />
                    </div>
                    
                    {/* Resize Button */}
                    <button
                      onClick={() => {
                        const currentSize = widgetSizes[widget.id] || widget.defaultSize || 'medium';
                        const nextSize = getNextSize(currentSize);
                        resizeWidget(widget.id, nextSize);
                      }}
                      className="absolute -top-2 -right-8 z-10 bg-secondary text-secondary-foreground rounded-full p-1 hover:bg-secondary/80 transition-colors"
                      title="Resize widget"
                    >
                      {(() => {
                        const currentSize = widgetSizes[widget.id] || widget.defaultSize || 'medium';
                        return currentSize === 'large' ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />;
                      })()}
                    </button>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                      title="Remove widget"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
                
                <WidgetComponent />
              </div>
            </div>
          );
        })}
        
        {/* Add Widget Button in Edit Mode */}
        {isEditMode && addableWidgets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors min-h-[120px] sm:min-h-[140px]">
                <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                  <span className="text-xs sm:text-sm text-center">Add Widget</span>
                </CardContent>
              </Card>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {addableWidgets.map((widget) => (
                <DropdownMenuItem 
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {widget.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No widgets configured
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Click "Customize" to add widgets to your dashboard.
            </p>
            <Button onClick={enterEditMode}>
              <Settings className="h-4 w-4 mr-2" />
              Customize Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};