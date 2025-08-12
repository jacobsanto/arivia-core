import { onCLS, onFID, onLCP, onINP, onTTFB, Metric } from 'web-vitals';
import { logger } from '@/services/logger';
import { recordAudit } from '@/services/auditLogs';

function handleMetric(metric: Metric) {
  const payload = {
    id: metric.id,
    name: metric.name,
    value: Math.round(metric.value),
    rating: (metric as any).rating,
  };

  // Log locally
  logger.performance(`WebVital ${metric.name}`, metric.value, metric.name);

  // Only persist poor metrics to audit logs
  if ((payload as any).rating === 'poor') {
    recordAudit('warn', `web_vital:${metric.name}`, {
      metadata: payload,
    });
  }
}

export function initWebVitals() {
  try {
    onCLS(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onINP(handleMetric);
    onTTFB(handleMetric);
  } catch {}
}
