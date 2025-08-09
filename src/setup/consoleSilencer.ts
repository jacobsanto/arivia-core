// Silences noisy console output in production while preserving warnings and errors
// Do not import this in tests. It should be imported once at app startup.

// Only apply in browser context and non-dev environments
if (typeof window !== 'undefined' && !(import.meta as any).env?.DEV) {
  const noop = () => {};
  // Suppress noisy logs in production
  // Keep warn/error for important signals
  // eslint-disable-next-line no-console
  console.log = noop;
  // eslint-disable-next-line no-console
  console.info = noop;
  // eslint-disable-next-line no-console
  console.debug = noop;
}
