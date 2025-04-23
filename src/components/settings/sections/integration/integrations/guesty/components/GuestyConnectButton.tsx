
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCcw, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Utility: get the latest Guesty connection/auth status
async function fetchConnectionStatus() {
  // Get last successful Guesty connection from sync_logs or system_settings
  // Prefer a log with sync_type="auth" OR use integration_health for exact status
  const { data: health } = await supabase
    .from("integration_health")
    .select("*")
    .eq("provider", "guesty")
    .maybeSingle();

  let status = "disconnected";
  let lastAuth: Date | null = null;
  let lastError: string | null = null;

  if (health) {
    if (health.status === "connected" && health.updated_at) {
      lastAuth = new Date(health.updated_at);
      // If within 2 hours
      if (Date.now() - lastAuth.getTime() < 2 * 3600 * 1000) status = "connected";
      else status = "stale";
    } else if (health.status === "error") {
      lastError = health.last_error ?? "Unknown error";
      status = "error";
    }
  }
  return { status, lastAuth, lastError };
}

interface GuestyConnectButtonProps {
  afterConnect?: () => void; // callback to refetch monitor, etc.
}

export const GuestyConnectButton: React.FC<GuestyConnectButtonProps> = ({ afterConnect }) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["guesty-connection-status"],
    queryFn: fetchConnectionStatus,
    refetchInterval: 20000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("guesty-auth", { method: "POST" });
      // Always refetch after
      await refetch();
      if (error) throw error;
      if (!data?.access_token) throw new Error(data?.error || "No token returned");
      return data;
    },
    onSuccess: () => {
      toast.success("Connected to Guesty!", { description: "Successfully authenticated." });
      if (afterConnect) afterConnect();
    },
    onError: (error: any) => {
      toast.error("Failed to connect to Guesty", {
        description: error?.message ?? "Unknown error",
      });
      if (afterConnect) afterConnect();
    },
  });

  let buttonLabel = "Connect to Guesty";
  if (data?.status === "connected") buttonLabel = "Connected ✅";
  else if (data?.status === "stale") buttonLabel = "Reconnect to Guesty";
  else if (data?.status === "error") buttonLabel = "Retry Connection";

  // Button/icon color logic
  let colorClass = "";
  let Icon = RefreshCcw;
  if (data?.status === "connected") {
    Icon = CheckCircle2;
    colorClass = "bg-green-100 text-green-700 hover:bg-green-200";
  } else if (data?.status === "error") {
    Icon = AlertTriangle;
    colorClass = "bg-red-100 text-red-700 hover:bg-red-200";
  } else if (data?.status === "stale") {
    Icon = RefreshCcw;
    colorClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  }

  // Use full-width on mobile, align left + stack with status text
  return (
    <div className={cn("flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full mb-2")}>
      <div className={cn("flex-1 min-w-0 flex items-center gap-2")}>
        <Button
          variant="outline"
          disabled={isFetching || mutation.isPending}
          onClick={() => mutation.mutate()}
          className={cn(
            "w-full md:w-auto justify-center flex items-center gap-2 px-4 py-2",
            colorClass,
            mutation.isPending ? "opacity-70" : ""
          )}
        >
          <Icon className="h-5 w-5 mr-2" />
          {mutation.isPending ? "Connecting..." : buttonLabel}
        </Button>
        {/* Optional: additional info */}
        <span className={cn(
          "text-xs ml-0 md:ml-3 mt-1 md:mt-0 truncate",
          data?.status === "connected" ? "text-green-700" : "",
          data?.status === "error" ? "text-red-700" : "",
          data?.status === "stale" ? "text-yellow-700" : ""
        )}>
          {data?.status === "connected" && data.lastAuth && (
            <>Last connected: {data.lastAuth.toLocaleString()}</>
          )}
          {data?.status === "stale" && data.lastAuth && (
            <>Last connection: {data.lastAuth.toLocaleString()}</>
          )}
          {data?.status === "error" && (
            <>Error: {data.lastError}</>
          )}
        </span>
      </div>
    </div>
  );
};

export default GuestyConnectButton;
