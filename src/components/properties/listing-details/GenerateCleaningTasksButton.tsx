
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { cleaningRulesService } from "@/services/housekeeping/cleaningRulesService";
import { toast } from "sonner";

interface GenerateCleaningTasksButtonProps {
  listingId: string;
  onTasksGenerated?: () => void;
}

const GenerateCleaningTasksButton: React.FC<GenerateCleaningTasksButtonProps> = ({
  listingId,
  onTasksGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{
    processed: number;
    tasksGenerated: number;
    timestamp: Date;
  } | null>(null);

  const handleGenerateTasks = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      toast.info(`Generating cleaning tasks for listing ${listingId}...`);
      
      const result = await cleaningRulesService.applyToListing(listingId);
      
      if (result.success) {
        setLastResult({
          processed: result.processed,
          tasksGenerated: result.tasksGenerated,
          timestamp: new Date()
        });
        
        toast.success(
          `Generated ${result.tasksGenerated} cleaning tasks for ${result.processed} bookings`
        );
        
        onTasksGenerated?.();
      } else {
        toast.error(`Failed to generate cleaning tasks: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating cleaning tasks:', error);
      toast.error("Failed to generate cleaning tasks");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTasks}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Cleaning Tasks
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Automatically generate cleaning tasks for all confirmed bookings in this property</p>
          </TooltipContent>
        </Tooltip>

        {lastResult && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {lastResult.tasksGenerated} tasks
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p>Last generated: {lastResult.timestamp.toLocaleString()}</p>
                <p>Processed {lastResult.processed} bookings</p>
                <p>Generated {lastResult.tasksGenerated} cleaning tasks</p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default GenerateCleaningTasksButton;
