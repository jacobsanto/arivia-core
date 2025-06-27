
import { ChecklistItem } from './checklistTypes';

export interface TaskComment {
  id: string;
  tenant_id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  assigned_role: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration?: number;
  checklist: ChecklistItem[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_role?: string;
  propertyId?: string;
  bookingId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  metadata?: Record<string, any>;
  type: string;
  checklist: ChecklistItem[];
  notes: string;
  attachments: string[];
  tags: string[];
  approvalStatus?: 'Approved' | 'Rejected' | 'Pending';
  photos: string[];
  cleaningDetails?: any;
  rejectionReason?: string;
}
