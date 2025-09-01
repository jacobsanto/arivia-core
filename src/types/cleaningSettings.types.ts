export type FrequencyType = 'once' | 'weekly';

export type ServiceType = 
  | 'turnover-clean'
  | 'mid-stay-tidy'
  | 'deep-clean'
  | 'linen-change'
  | 'maintenance-clean'
  | 'guest-checkout-clean';

export interface CleaningRule {
  id: string;
  name: string;
  minNights: number;
  maxNights?: number; // undefined means "and up"
  serviceType: ServiceType;
  frequency: FrequencyType;
  dayOfStay?: number; // for "once" frequency
  dayOfWeek?: string; // for "weekly" frequency
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CleaningSettings {
  isAutomatedSchedulingEnabled: boolean;
  defaultCleaningTime: string; // HH:MM format
  rules: CleaningRule[];
  serviceLevelConfig: ServiceLevelConfig;
}

export interface ServiceLevelConfig {
  'turnover-clean': string | null;
  'mid-stay-tidy': string | null;
  'deep-clean': string | null;
  'linen-change': string | null;
  'maintenance-clean': string | null;
  'guest-checkout-clean': string | null;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'housekeeping' | 'maintenance';
  description?: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  'turnover-clean': 'Turnover Clean',
  'mid-stay-tidy': 'Mid-stay Tidy',
  'deep-clean': 'Deep Clean',
  'linen-change': 'Linen Change',
  'maintenance-clean': 'Maintenance Clean',
  'guest-checkout-clean': 'Guest Checkout Clean'
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];