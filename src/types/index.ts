export type UserRole = 'student' | 'admin' | 'super_admin';

export interface PrayerType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  unit_name: string;
  default_step: number;
  is_active: boolean;
  created_at: string;
}

export interface PrayerSubmission {
  id: string;
  prayer_type_id: string;
  quantity: number;
  prayer_date: string;
  submitted_at: string;
  timezone: string;
  is_anonymous: boolean;
  status: 'approved' | 'pending' | 'flagged';
  created_at: string;
  updated_at: string;
  // Denormalized metadata
  prayer_type_name?: string;
  prayer_type_slug?: string;
  prayer_type_icon?: string;
  campus_id?: string;
  campus_name?: string;
  optional_note?: string;
}

export interface PrayerAuditLog {
  id: string;
  submission_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ADMIN_CORRECTION';
  changed_by?: string;
  old_quantity?: number;
  new_quantity?: number;
  old_prayer_type?: string;
  new_prayer_type?: string;
  timestamp: string;
  reason?: string;
}

export interface PrayerTypeStat {
  prayer_type_id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  total_quantity: number;
  total_submissions: number;
  target_goal: number;
}

export interface ActivityFeedItem {
  id: string;
  prayer_type_name: string;
  prayer_type_slug: string;
  quantity: number;
  submitted_at: string;
  is_anonymous: boolean;
}

export interface DailySummary {
  date: string;
  total_offerings: number;
  submission_count: number;
  breakdown: Record<string, number>;
}

