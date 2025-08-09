import { useEffect, useRef, useState } from "react";
import { resolveSignedUrl } from "@/utils/storageUrls";

interface UseSignedUrlOptions {
  fallbackBucket?: string;
  expiresInSeconds?: number;
  refreshMarginSeconds?: number; // how early to refresh before expiry
}

export function useSignedUrl(
  raw: string | null | undefined,
  {
    fallbackBucket,
    expiresInSeconds = 60 * 60,
    refreshMarginSeconds = 60,
  }: UseSignedUrlOptions = {}
) {
  const [url, setUrl] = useState<string>("/placeholder.svg");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!raw || raw.includes("placeholder.svg")) {
        setUrl("/placeholder.svg");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const signed = await resolveSignedUrl(raw, fallbackBucket, expiresInSeconds);
        if (!cancelled) setUrl(signed);

        // Schedule refresh a bit before expiry if this looks like a storage path
        if (!cancelled) {
          const needsRefresh = !/^https?:\/\//i.test(raw) || /\/storage\/v1\/object\//i.test(raw);
          if (needsRefresh) {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            const refreshIn = Math.max(5, expiresInSeconds - refreshMarginSeconds) * 1000;
            timerRef.current = window.setTimeout(resolve, refreshIn);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to resolve signed URL");
          setUrl("/placeholder.svg");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    resolve();

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [raw, fallbackBucket, expiresInSeconds, refreshMarginSeconds]);

  const refresh = async () => {
    try {
      const signed = await resolveSignedUrl(raw || "", fallbackBucket, expiresInSeconds);
      setUrl(signed);
    } catch (e: any) {
      setError(e?.message || "Failed to refresh signed URL");
    }
  };

  return { url, loading, error, refresh };
}
