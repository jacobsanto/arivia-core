import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PropertyListItem, 
  PropertyViewMode 
} from "@/types/property-detailed.types";
import { 
  MapPin, 
  Bed, 
  Bath, 
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit
} from "lucide-react";

interface PropertyListViewProps {
  properties: PropertyListItem[];
  viewMode: PropertyViewMode;
  onViewModeChange: (update: Partial<PropertyViewMode>) => void;
  onQuickAction?: (propertyId: string, action: string) => void;
}

export const PropertyListView: React.FC<PropertyListViewProps> = ({
  properties,
  viewMode,
  onViewModeChange,
  onQuickAction
}) => {
  const navigate = useNavigate();

  const handleSort = (column: PropertyViewMode['sort_by']) => {
    const newDirection = 
      viewMode.sort_by === column && viewMode.sort_direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onViewModeChange({
      sort_by: column,
      sort_direction: newDirection
    });
  };

  const sortedProperties = React.useMemo(() => {
    return [...properties].sort((a, b) => {
      const { sort_by, sort_direction } = viewMode;
      let aValue: any, bValue: any;

      switch (sort_by) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'room_status':
          aValue = a.room_status;
          bValue = b.room_status;
          break;
        case 'issues':
          aValue = a.open_issues_count;
          bValue = b.open_issues_count;
          break;
        case 'type':
          aValue = a.property_type;
          bValue = b.property_type;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort_direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort_direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [properties, viewMode]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'occupied': return 'default';
      case 'vacant': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoomStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'cleaned': return 'secondary';
      case 'cleaning': return 'outline';
      case 'inspected': return 'default';
      case 'dirty': return 'destructive';
      default: return 'outline';
    }
  };

  const SortButton = ({ column, children }: { column: PropertyViewMode['sort_by'], children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold hover:bg-transparent"
      onClick={() => handleSort(column)}
    >
      <span className="flex items-center gap-1">
        {children}
        {viewMode.sort_by === column && (
          viewMode.sort_direction === 'asc' 
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
        )}
      </span>
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>
              <SortButton column="name">Property</SortButton>
            </TableHead>
            <TableHead>
              <SortButton column="type">Type</SortButton>
            </TableHead>
            <TableHead>
              <SortButton column="status">Status</SortButton>
            </TableHead>
            <TableHead>
              <SortButton column="room_status">Room Status</SortButton>
            </TableHead>
            <TableHead>Specs</TableHead>
            <TableHead>
              <SortButton column="issues">Issues</SortButton>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProperties.map((property) => (
            <TableRow 
              key={property.id}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    {property.name}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {property.address}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {property.property_type}
                </Badge>
              </TableCell>
              
              <TableCell>
                <Badge variant={getStatusBadgeVariant(property.status)} className="capitalize">
                  {property.status}
                </Badge>
              </TableCell>
              
              <TableCell>
                <Badge variant={getRoomStatusBadgeVariant(property.room_status)} className="capitalize">
                  {property.room_status}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {property.num_bedrooms}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {property.num_bathrooms}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {property.open_issues_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={property.urgent_issues_count > 0 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {property.open_issues_count}
                    </Badge>
                    {property.urgent_issues_count > 0 && (
                      <span className="text-xs text-destructive font-medium">
                        {property.urgent_issues_count} urgent
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction?.(property.id, 'edit');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {sortedProperties.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <div className="space-y-2">
            <div className="text-lg font-medium">No properties found</div>
            <div className="text-sm">Try adjusting your filters to see more results.</div>
          </div>
        </div>
      )}
    </div>
  );
};