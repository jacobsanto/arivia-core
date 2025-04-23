
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GuestyConnectButtonProps {
  afterConnect?: () => void; // callback to refetch monitor, etc.
}

type GuestyAuthCheckStatus = "unknown" | "connected" | "disconnected" | "error" | "loading";

export const GuestyConnectButton: React.FC<GuestyConnectButtonProps> = ({ afterConnect }) => {
  const isMobile = useIsMobile();

  const [status, setStatus] = React.useState<GuestyAuthCheckStatus>("unknown");
  const [lastConnect, setLastConnect] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // When button is clicked: call guesty-auth-check
  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg(null);
    // Save old lastConnect for error fallback
    try {
      const resp = await fetch(`/functions/v1/guesty-auth-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Supabase Edge Functions behind /functions/v1/
        },
      });
      const data = await resp.json();

      if (resp.ok && data.status === "ok") {
        setStatus("connected");
        setLastConnect(data.connected_at ? new Date(data.connected_at) : new Date());
        toast.success("Guesty connection successful", {
          description: `Connected at ${data.connected_at ? new Date(data.connected_at).toLocaleString() : new Date().toLocaleString()}`,
        });
        setErrorMsg(null);
        if (afterConnect) afterConnect();
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Unknown error");
        toast.error("Failed to connect", {
          description: data.message || "Unknown error",
        });
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Unknown error");
      toast.error("Failed to connect", { description: err?.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  // Set initial state on mount, try auto-fetch if needed
  React.useEffect(() => {
    // On mount, show default Disconnected badge (could also fetch initial status here)
    setStatus("disconnected");
    setErrorMsg(null);
    setLastConnect(null);
  }, []);

  // Badge and button rendering logic
  let badgeContent: React.ReactNode = null;
  let buttonLabel = "Connect to Guesty";
  let badgeColor =
    status === "connected"
      ? "text-green-700 bg-green-100"
      : status === "error"
      ? "text-red-700 bg-red-100"
      : "text-yellow-800 bg-yellow-100";

  if (status === "connected" && lastConnect) {
    badgeContent = (
      <span className="flex items-center gap-1 font-medium">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span>🟢 Connected to Guesty</span>
        <span className="ml-2 text-xs font-normal text-green-800">
          (at {lastConnect.toLocaleString()})
        </span>
      </span>
    );
    buttonLabel = "Connected";
  } else if (status === "error" || status === "disconnected") {
    badgeContent = (
      <span className="flex items-center gap-1 font-medium">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span>❌ Guesty Disconnected</span>
        {errorMsg && (
          <span className="ml-2 text-xs font-normal text-red-800">
            {errorMsg}
          </span>
        )}
      </span>
    );
    buttonLabel = "Retry Connection";
  } else if (status === "loading" || loading) {
    badgeContent = (
      <span className="flex items-center gap-1 font-medium">
        <RefreshCcw className="h-4 w-4 animate-spin" />
        <span>Connecting to Guesty…</span>
      </span>
    );
    buttonLabel = "Connecting...";
  }

  return (
    <div
      className={cn(
        "w-full flex flex-col",
        isMobile ? "gap-3" : "md:flex-row md:items-center md:gap-4",
        "mb-2"
      )}
    >
      <div className={cn("flex-1 min-w-0 flex", isMobile ? "flex-col items-stretch" : "flex-row items-center gap-4")}>
        {/* Badge (top/left on mobile, left on desktop) */}
        <div
          className={cn(
            "px-3 py-2 rounded-md mb-2 md:mb-0 md:mr-1 min-w-[180px]",
            badgeColor
          )}
        >
          {badgeContent}
        </div>
        {/* Button (full width on mobile) */}
        <Button
          variant="outline"
          className={cn(
            isMobile ? "w-full" : "w-auto",
            "justify-center flex items-center px-4 py-2"
          )}
          disabled={loading}
          onClick={handleConnect}
        >
          {loading ? (
            <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
          ) : status === "connected" ? (
            <CheckCircle2 className="h-5 w-5 mr-2" />
          ) : (
            <RefreshCcw className="h-5 w-5 mr-2" />
          )}
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
export default GuestyConnectButton;
