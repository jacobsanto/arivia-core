export function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  if (k.includes('password') || k.includes('secret') || k.includes('token')) return true;
  if (k.includes('smtp_password')) return true;
  if (k.includes('api_key') || k.includes('apikey')) return true;
  // Only treat generic "key" as sensitive if paired with api-like prefixes
  if ((k.endsWith('_key') || k.includes('access_key')) && (k.includes('api') || k.includes('access'))) return true;
  return false;
}

export function maskSensitive(key: string, value: unknown): unknown {
  if (!isSensitiveKey(key)) return value;
  const placeholder = '••••••••';
  if (typeof value === 'string') return placeholder;
  if (typeof value === 'number') return placeholder;
  if (typeof value === 'boolean') return placeholder;
  if (Array.isArray(value)) return value.map(() => placeholder);
  if (value && typeof value === 'object') return placeholder;
  return placeholder;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return truncate(value, 200);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return truncate(JSON.stringify(value), 200);
  } catch {
    return '—';
  }
}

function truncate(input: string, max = 200): string {
  if (input.length <= max) return input;
  return input.slice(0, max - 1) + '…';
}
