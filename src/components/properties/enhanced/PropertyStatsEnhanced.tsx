import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyListItem } from "@/types/property-detailed.types";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Home
} from "lucide-react";

interface PropertyStatsProps {
  properties: PropertyListItem[];
}

export const PropertyStatsEnhanced: React.FC<PropertyStatsProps> = ({ properties }) => {
  const stats = React.useMemo(() => {
    const total = properties.length;
    
    // Status breakdown
    const occupied = properties.filter(p => p.status === 'occupied').length;
    const vacant = properties.filter(p => p.status === 'vacant').length;
    const maintenance = properties.filter(p => p.status === 'maintenance').length;
    
    // Room status breakdown
    const ready = properties.filter(p => p.room_status === 'ready').length;
    const dirty = properties.filter(p => p.room_status === 'dirty').length;
    const cleaning = properties.filter(p => p.room_status === 'cleaning').length;
    const cleaned = properties.filter(p => p.room_status === 'cleaned').length;
    const inspected = properties.filter(p => p.room_status === 'inspected').length;
    
    // Issues
    const withIssues = properties.filter(p => p.open_issues_count > 0).length;
    const withUrgentIssues = properties.filter(p => p.urgent_issues_count > 0).length;
    const totalIssues = properties.reduce((sum, p) => sum + p.open_issues_count, 0);
    
    // Property types
    const villas = properties.filter(p => p.property_type === 'villa').length;
    const apartments = properties.filter(p => p.property_type === 'apartment').length;
    const houses = properties.filter(p => p.property_type === 'house').length;

    return {
      total,
      occupied,
      vacant,
      maintenance,
      ready,
      dirty,
      cleaning,
      cleaned,
      inspected,
      withIssues,
      withUrgentIssues,
      totalIssues,
      villas,
      apartments,
      houses,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      readinessRate: total > 0 ? Math.round((ready / total) * 100) : 0,
      issueRate: total > 0 ? Math.round((withIssues / total) * 100) : 0
    };
  }, [properties]);

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {/* Total Properties */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
          <div className="text-xs text-muted-foreground">
            {stats.villas} villas, {stats.apartments} apartments
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${stats.occupancyRate > 70 ? 'bg-green-500' : stats.occupancyRate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <div className="text-sm text-muted-foreground">Occupancy</div>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.occupancyRate}%</div>
          <div className="text-xs text-muted-foreground">
            {stats.occupied} occupied, {stats.vacant} vacant
          </div>
        </CardContent>
      </Card>

      {/* Readiness Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div className="text-sm text-muted-foreground">Ready</div>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.readinessRate}%</div>
          <div className="text-xs text-muted-foreground">
            {stats.ready} ready, {stats.dirty} need cleaning
          </div>
        </CardContent>
      </Card>

      {/* Rooms in Process */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-muted-foreground">In Process</div>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.cleaning + stats.cleaned + stats.inspected}</div>
          <div className="text-xs text-muted-foreground">
            Cleaning + cleaned + inspected
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${stats.withUrgentIssues > 0 ? 'text-red-600' : 'text-yellow-600'}`} />
            <div className="text-sm text-muted-foreground">Issues</div>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalIssues}</div>
          <div className="text-xs text-muted-foreground">
            {stats.withUrgentIssues} urgent, {stats.withIssues} properties
          </div>
        </CardContent>
      </Card>

      {/* Issue Rate Trend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {stats.issueRate < 20 ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-600" />
            )}
            <div className="text-sm text-muted-foreground">Issue Rate</div>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.issueRate}%</div>
          <div className="text-xs text-muted-foreground">
            Properties with issues
          </div>
        </CardContent>
      </Card>
    </div>
  );
};