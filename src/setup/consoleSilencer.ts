// Silences noisy console output in production while preserving warnings and errors
// Do not import this in tests. It should be imported once at app startup.

// Only apply in browser context and non-dev environments
if (typeof window !== 'undefined' && !(import.meta as any).env?.DEV) {
  const original = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
  };

  const noop = () => {};

  // Suppress noisy logs in production
  // eslint-disable-next-line no-console
  console.log = noop;
  // eslint-disable-next-line no-console
  console.info = noop;
  // eslint-disable-next-line no-console
  console.debug = noop;

  // Simple sanitizer to avoid leaking sensitive info
  const redactKeys = ['password', 'token', 'secret', 'authorization', 'auth', 'email'];
  const sanitize = (value: any, depth = 0): any => {
    if (depth > 2) return '[depth]';
    if (value instanceof Error) return value.message;
    if (value && typeof value === 'object') {
      const out: Record<string, any> = Array.isArray(value) ? [] as any : {};
      for (const [k, v] of Object.entries(value)) {
        if (redactKeys.includes(k.toLowerCase())) {
          (out as any)[k] = '[redacted]';
        } else {
          (out as any)[k] = sanitize(v as any, depth + 1);
        }
      }
      return out;
    }
    return value;
  };

  // Wrap warn/error to sanitize payloads but keep visibility
  // eslint-disable-next-line no-console
  console.warn = (...args: any[]) => {
    try { original.warn.apply(console, args.map(a => sanitize(a))); } catch {}
  };
  // eslint-disable-next-line no-console
  console.error = (...args: any[]) => {
    try { original.error.apply(console, args.map(a => sanitize(a))); } catch {}
  };
}

