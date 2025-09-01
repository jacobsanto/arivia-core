import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  ArrowRight,
  Package,
  FileText,
  ShoppingCart
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format } from "date-fns";

const getActionIcon = (type: string) => {
  switch (type) {
    case 'purchase_order': return ShoppingCart;
    case 'transfer_request': return Package;
    case 'approval_needed': return FileText;
    default: return Clock;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-red-500 text-red-700';
    case 'medium': return 'border-yellow-500 text-yellow-700';
    case 'low': return 'border-green-500 text-green-700';
    default: return 'border-gray-500 text-gray-700';
  }
};

export const ActionItemsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { actionItems, loading } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Action Items
          <Badge variant="outline">
            {actionItems?.length || 0} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!actionItems || actionItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>No pending action items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item) => {
              const ActionIcon = getActionIcon(item.type);
              
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/inventory')}
                >
                  <ActionIcon className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                    {item.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(item.dueDate), 'MMM dd')}
                      </p>
                    )}
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/inventory')}
          >
            View All Action Items
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};