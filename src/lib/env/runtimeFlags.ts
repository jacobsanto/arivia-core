// Runtime environment flags for preview/dev detection
// These helpers avoid build-time env vars and use runtime checks instead

export const isInIframe = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access throws when embedded; treat as iframe
    return true;
  }
};

export const isLovablePreviewEnv = (): boolean => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname || "";
  // In Lovable editor the app runs inside an iframe; also cover lovable.app domains
  return isInIframe() || host.includes("lovable.app");
};

export const shouldBypassAuth = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    // Always bypass inside Lovable preview/editor
    if (isLovablePreviewEnv()) return true;
    // Optional manual toggle for local/manual preview
    return localStorage.getItem("PREVIEW_BYPASS_AUTH") === "true";
  } catch {
    return isLovablePreviewEnv();
  }
};
