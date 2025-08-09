import { supabase } from "@/integrations/supabase/client";

// Resolve a URL to a signed URL if it's a Supabase Storage public URL or a storage path
// - If http(s) non-supabase: returns as-is
// - If Supabase public URL: extracts bucket/path and creates signed URL
// - If raw storage path (e.g., "bucket/path/to/file.jpg"): signs using detected or provided bucket
export async function resolveSignedUrl(raw: string, fallbackBucket?: string, expiresInSeconds = 3600): Promise<string> {
  if (!raw) return "/placeholder.svg";
  // If already a regular external URL (not Supabase storage), return as-is
  if (/^https?:\/\//i.test(raw) && !/\/storage\/v1\/object\//i.test(raw)) {
    return raw;
  }

  // If it's a Supabase storage URL, try to parse bucket and path
  const storageMatch = raw.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/i);
  if (storageMatch) {
    const [, bucket, path] = storageMatch;
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    return data?.signedUrl || "/placeholder.svg";
  }

  // If it's a raw storage path, try to detect bucket from prefix
  // Format: "bucket/path/to/file"
  const parts = raw.split("/");
  if (parts.length > 1) {
    const candidateBucket = parts[0];
    const path = parts.slice(1).join("/");
    const { data } = await supabase.storage.from(candidateBucket).createSignedUrl(path, expiresInSeconds);
    if (data?.signedUrl) return data.signedUrl;
  }

  // If a fallback bucket was provided, try signing with it
  if (fallbackBucket) {
    const { data } = await supabase.storage.from(fallbackBucket).createSignedUrl(raw, expiresInSeconds);
    if (data?.signedUrl) return data.signedUrl;
  }

  return "/placeholder.svg";
}
