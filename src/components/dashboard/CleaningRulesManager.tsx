
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { cleaningRulesService, CleaningRulesApplicationResult } from "@/services/housekeeping/cleaningRulesService";
import { toast } from "sonner";

const CleaningRulesManager: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<CleaningRulesApplicationResult | null>(null);
  const [missingTasksReport, setMissingTasksReport] = useState<{
    totalBookings: number;
    bookingsWithTasks: number;
    bookingsMissingTasks: number;
    missingTasksBookings: Array<{
      id: string;
      listing_id: string;
      guest_name: string;
      check_in: string;
      check_out: string;
      stay_duration: number;
    }>;
  } | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleApplyAllRules = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      toast.info("Starting cleaning rules application for all bookings...");
      
      const result = await cleaningRulesService.applyToAllBookings({
        batchSize: 50
      });
      
      setLastResult(result);
      
      if (result.success) {
        toast.success(
          `Successfully processed ${result.processed} bookings and generated ${result.tasksGenerated} cleaning tasks`
        );
        
        // Refresh the report after successful processing
        await loadMissingTasksReport();
      } else {
        toast.error(`Failed to apply cleaning rules: ${result.error}`);
      }
    } catch (error) {
      console.error('Error applying cleaning rules:', error);
      toast.error("Failed to apply cleaning rules to bookings");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadMissingTasksReport = async () => {
    setIsLoadingReport(true);
    try {
      const report = await cleaningRulesService.getMissingTasksReport();
      setMissingTasksReport(report);
    } catch (error) {
      console.error('Error loading missing tasks report:', error);
      toast.error("Failed to load missing tasks report");
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Load report on component mount
  React.useEffect(() => {
    loadMissingTasksReport();
  }, []);

  const getCoveragePercentage = () => {
    if (!missingTasksReport || missingTasksReport.totalBookings === 0) return 0;
    return Math.round((missingTasksReport.bookingsWithTasks / missingTasksReport.totalBookings) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cleaning Rules Status
          </CardTitle>
          <CardDescription>
            Monitor and manage automatic cleaning task generation for all bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coverage Overview */}
          {missingTasksReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Task Coverage</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMissingTasksReport}
                  disabled={isLoadingReport}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingReport ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bookings with cleaning tasks</span>
                  <span>{missingTasksReport.bookingsWithTasks} / {missingTasksReport.totalBookings}</span>
                </div>
                <Progress value={getCoveragePercentage()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {getCoveragePercentage()}% coverage ({missingTasksReport.bookingsMissingTasks} bookings missing tasks)
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Bulk Actions</h3>
                <p className="text-xs text-muted-foreground">
                  Apply cleaning rules to bookings that don't have tasks yet
                </p>
              </div>
              <Button
                onClick={handleApplyAllRules}
                disabled={isProcessing || (missingTasksReport?.bookingsMissingTasks === 0)}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Apply to All Bookings
                  </>
                )}
              </Button>
            </div>

            {missingTasksReport?.bookingsMissingTasks === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  All active bookings already have cleaning tasks generated. No action needed.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Last Processing Result */}
          {lastResult && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Last Processing Result</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Processed</p>
                    <p className="text-sm font-medium">{lastResult.processed}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tasks Generated</p>
                    <p className="text-sm font-medium">{lastResult.tasksGenerated}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{(lastResult.duration / 1000).toFixed(1)}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={lastResult.success ? "default" : "destructive"}>
                      {lastResult.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </div>
                
                {lastResult.errors && lastResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>Some bookings failed to process:</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {lastResult.errors.slice(0, 3).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {lastResult.errors.length > 3 && (
                            <li>... and {lastResult.errors.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* Missing Tasks Summary */}
          {missingTasksReport && missingTasksReport.missingTasksBookings.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Bookings Missing Cleaning Tasks</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {missingTasksReport.missingTasksBookings.slice(0, 10).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="text-xs font-medium">{booking.guest_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.listing_id} • {booking.stay_duration} nights
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">{new Date(booking.check_in).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">to {new Date(booking.check_out).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {missingTasksReport.missingTasksBookings.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {missingTasksReport.missingTasksBookings.length - 10} more bookings
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CleaningRulesManager;
