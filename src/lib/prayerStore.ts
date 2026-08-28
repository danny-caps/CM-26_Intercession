import { 
  PrayerType, 
  PrayerSubmission, 
  PrayerTypeStat, 
  ActivityFeedItem, 
  DailySummary 
} from '../types';
import { INITIAL_PRAYER_TYPES, INITIAL_SUBMISSIONS } from './initialData';

const STORAGE_KEYS = {
  PRAYER_TYPES: 'jy_prayer_types_v3',
  SUBMISSIONS: 'jy_submissions_v4',
};

// Helper for local storage parsing with default fallback
function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

// Global subscriber events for real-time React updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Store listener error', e);
    }
  });
}

// Initialize seed data & sync with Supabase backend
export async function initStore() {
  const storedTypes = getStored<PrayerType[]>(STORAGE_KEYS.PRAYER_TYPES, []);
  const validSlugs = new Set(['holy-mass', 'eucharistic-visits', 'fastings', 'way-of-cross', 'our-father', 'decades']);
  const hasInvalidTypes = storedTypes.length !== 6 || storedTypes.some(t => !validSlugs.has(t.slug));

  if (hasInvalidTypes) {
    setStored(STORAGE_KEYS.PRAYER_TYPES, INITIAL_PRAYER_TYPES);
  }

  const storedSubs = getStored<PrayerSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  if (storedSubs.length === 0) {
    setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }

  // Asynchronously fetch latest submissions from Supabase API
  try {
    const response = await fetch('/api/submissions');
    if (response.ok) {
      const { data } = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const local = getStored<PrayerSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
        const idSet = new Set(data.map((d: any) => d.id));
        const merged = [...data, ...local.filter(l => !idSet.has(l.id))];
        setStored(STORAGE_KEYS.SUBMISSIONS, merged);
        notifyListeners();
      }
    }
  } catch {
    // Graceful offline fallback to local cached submissions
  }
}

// Execute store initialization immediately on load
if (typeof window !== 'undefined') {
  initStore();
}

export const prayerStore = {
  // === PRAYER TYPES ===
  getPrayerTypes(): PrayerType[] {
    return getStored<PrayerType[]>(STORAGE_KEYS.PRAYER_TYPES, INITIAL_PRAYER_TYPES);
  },

  // === SUBMISSIONS ===
  getSubmissions(filter?: { prayer_type_id?: string; status?: string; query?: string }): PrayerSubmission[] {
    let list = getStored<PrayerSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);

    if (filter?.prayer_type_id && filter.prayer_type_id !== 'all') {
      list = list.filter(s => s.prayer_type_id === filter.prayer_type_id);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(s => s.status === filter.status);
    }
    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(s => 
        s.prayer_type_name?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async submitPrayer(input: {
    prayer_type_id: string;
    quantity: number;
  }): Promise<PrayerSubmission> {
    const prayerTypes = this.getPrayerTypes();
    const targetPrayer = prayerTypes.find(p => p.id === input.prayer_type_id);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const newSubmission: PrayerSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      prayer_type_id: input.prayer_type_id,
      quantity: Math.max(1, input.quantity),
      prayer_date: today,
      submitted_at: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      is_anonymous: true,
      status: 'approved',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      prayer_type_name: targetPrayer?.name || 'Prayer Offering',
      prayer_type_slug: targetPrayer?.slug || 'holy-mass',
      prayer_type_icon: targetPrayer?.icon || 'Flame',
    };

    // 1. Optimistic Local Save
    const submissions = getStored<PrayerSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    submissions.unshift(newSubmission);
    setStored(STORAGE_KEYS.SUBMISSIONS, submissions);
    notifyListeners();

    // 2. Asynchronous Remote Sync to Supabase PostgreSQL backend
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prayer_type_id: input.prayer_type_id,
          quantity: input.quantity,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data && data.id) {
          const current = getStored<PrayerSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
          const idx = current.findIndex(s => s.id === newSubmission.id);
          if (idx !== -1) {
            current[idx] = data;
            setStored(STORAGE_KEYS.SUBMISSIONS, current);
          }
        }
      }
    } catch (err) {
      console.warn('Syncing prayer to Supabase backend in background:', err);
    }

    return newSubmission;
  },

  // === ANALYTICS & DASHBOARD METRICS ===
  getTotalStats() {
    const submissions = this.getSubmissions({ status: 'approved' });
    const prayerStats = this.getPrayerTypeStats();

    const total_offerings = prayerStats.reduce((sum, p) => sum + p.total_quantity, 0);
    const total_submissions = prayerStats.reduce((sum, p) => sum + p.total_submissions, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySubmissions = submissions.filter(s => s.prayer_date === todayStr);
    const today_offerings = todaySubmissions.reduce((acc, s) => acc + s.quantity, 0);
    const today_submissions_count = todaySubmissions.length;

    return {
      total_offerings,
      total_submissions,
      today_offerings,
      today_submissions_count,
    };
  },

  getPrayerTypeStats(): PrayerTypeStat[] {
    const types = this.getPrayerTypes().filter(t => t.is_active);
    const submissions = this.getSubmissions({ status: 'approved' });

    // Target milestones for Campus Meet '26 intercession for the 6 core prayer types
    const TARGET_GOALS: Record<string, number> = {
      'holy-mass': 1000,
      'eucharistic-visits': 5000,
      'fastings': 2000,
      'way-of-cross': 1500,
      'our-father': 50000,
      'decades': 30000,
    };

    return types.map(t => {
      const customSubs = submissions.filter(s => s.prayer_type_id === t.id);
      const total_quantity = customSubs.reduce((sum, s) => sum + s.quantity, 0);
      const total_submissions = customSubs.length;

      return {
        prayer_type_id: t.id,
        name: t.name,
        slug: t.slug,
        icon: t.icon,
        description: t.description,
        total_quantity,
        total_submissions,
        target_goal: TARGET_GOALS[t.slug] || 5000,
      };
    });
  },

  getRecentActivity(limit = 12): ActivityFeedItem[] {
    const submissions = this.getSubmissions({ status: 'approved' }).slice(0, limit);
    return submissions.map(sub => {
      return {
        id: sub.id,
        prayer_type_name: sub.prayer_type_name || 'Prayer Offering',
        prayer_type_slug: sub.prayer_type_slug || 'holy-mass',
        quantity: sub.quantity,
        submitted_at: sub.submitted_at,
        is_anonymous: true,
      };
    });
  },

  getDailySummaries(): DailySummary[] {
    const submissions = this.getSubmissions({ status: 'approved' });
    if (submissions.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      return [{
        date: today,
        total_offerings: 0,
        submission_count: 0,
        breakdown: {},
      }];
    }

    const byDate: Record<string, DailySummary> = {};
    submissions.forEach(sub => {
      const d = sub.prayer_date || sub.submitted_at.split('T')[0];
      if (!byDate[d]) {
        byDate[d] = {
          date: d,
          total_offerings: 0,
          submission_count: 0,
          breakdown: {},
        };
      }
      byDate[d].total_offerings += sub.quantity;
      byDate[d].submission_count += 1;
      const slug = sub.prayer_type_slug || 'prayer';
      byDate[d].breakdown[slug] = (byDate[d].breakdown[slug] || 0) + sub.quantity;
    });

    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  },
};
