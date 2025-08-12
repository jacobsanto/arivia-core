import { supabase } from "@/integrations/supabase/client";

export type AuditLevel = 'info' | 'warn' | 'error';

function getRoute(): string | undefined {
  try {
    return typeof window !== 'undefined' ? window.location.pathname : undefined;
  } catch {
    return undefined;
  }
}

export async function recordAudit(
  level: AuditLevel,
  message: string,
  opts?: {
    error_name?: string;
    error_stack?: string;
    component?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id ?? null;

    const payload: Record<string, unknown> = {
      user_id,
      level,
      message,
      route: getRoute(),
      error_name: opts?.error_name,
      error_stack: opts?.error_stack?.slice(0, 4000),
      metadata: opts?.metadata ?? {},
    };

    // Remove undefined fields to satisfy column constraints
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    await supabase.from('audit_logs').insert(payload as any);
  } catch (e) {
    // Swallow audit logging errors to avoid cascading failures
  }
}
