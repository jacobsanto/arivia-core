
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { guestyBookingSyncService } from "@/services/guesty/guestyBookingSyncService";
import { toast } from "sonner";
import CleaningRulesManager from "./CleaningRulesManager";

interface DashboardContentProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: string | null;
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
  onRefresh?: () => Promise<any>;
  onAddSampleData?: () => Promise<void>;
  onBookingSync?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData,
  isLoading,
  error,
  favoriteMetrics,
  onToggleFavorite,
  onRefresh,
  onAddSampleData,
  onBookingSync
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const handleBookingSync = async () => {
    setIsSyncing(true);
    try {
      toast.info("Starting Guesty booking sync...");
      const result = await guestyBookingSyncService.syncAllBookings();
      if (result.success) {
        toast.success(result.message);
        onBookingSync?.(); // Refresh bookings
        onRefresh?.(); // Refresh dashboard
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error syncing bookings:", error);
      toast.error("Failed to sync bookings");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Ariviva Ops</CardTitle>
            <CardDescription>
              Manage your properties and bookings efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Bookings</h3>
              <p className="text-sm text-muted-foreground">
                Sync your Guesty bookings to keep your data up-to-date.
              </p>
              <Button onClick={handleBookingSync} disabled={isSyncing}>
                {isSyncing ? "Syncing..." : "Sync Bookings"}
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Calendar</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Add the Cleaning Rules Manager section */}
      <section>
        <CleaningRulesManager />
      </section>
    </div>
  );
};

export default DashboardContent;
