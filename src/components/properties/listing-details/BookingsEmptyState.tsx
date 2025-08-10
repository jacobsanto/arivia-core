
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { BookingSyncButton } from "./BookingSyncButton";

interface BookingsEmptyStateProps {
  onSync: () => void;
  isSyncing: boolean;
}

const BookingsEmptyState: React.FC<BookingsEmptyStateProps> = ({ onSync, isSyncing }) => (
  <Card className="border border-dashed">
    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium mb-1">No Bookings Found</h3>
      <p className="text-muted-foreground mb-4">
        This property doesn't have any bookings yet.
      </p>
      <BookingSyncButton 
        variant="default" 
        onSyncComplete={onSync}
      />
    </CardContent>
  </Card>
);

export default BookingsEmptyState;
