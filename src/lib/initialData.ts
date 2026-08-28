import { PrayerType, PrayerSubmission } from '../types';

// Strict 6 core requested Catholic prayer types
export const INITIAL_PRAYER_TYPES: PrayerType[] = [
  {
    id: 'pt-holy-mass',
    name: 'Holy Mass',
    slug: 'holy-mass',
    description: 'The source and summit of Christian life offered for the youth and fruits of Campus Meet ’26.',
    icon: 'Flame',
    unit_name: 'Masses',
    default_step: 1,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'pt-eucharistic-visits',
    name: 'Eucharistic Visits',
    slug: 'eucharistic-visits',
    description: 'Visits to the Blessed Sacrament in campus chapels and parish churches for divine grace.',
    icon: 'Church',
    unit_name: 'visits',
    default_step: 1,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'pt-fastings',
    name: 'Fastings',
    slug: 'fastings',
    description: 'Consecrated meals or days in self-denial and earnest intercession for campus souls.',
    icon: 'Coffee',
    unit_name: 'fasts',
    default_step: 1,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'pt-way-of-cross',
    name: 'Way of Cross',
    slug: 'way-of-cross',
    description: 'Meditating on the Passion of our Lord Jesus Christ for repentance and spiritual revival.',
    icon: 'Compass',
    unit_name: 'prayers',
    default_step: 1,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'pt-our-father',
    name: 'Our Father',
    slug: 'our-father',
    description: 'The Lord’s Prayer uniting campus hearts as one family in Christ Jesus.',
    icon: 'Cross',
    unit_name: 'prayers',
    default_step: 5,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'pt-decades',
    name: 'Decades',
    slug: 'decades',
    description: 'Decades of the Holy Rosary offered through Our Lady for the participants and team.',
    icon: 'Disc',
    unit_name: 'decades',
    default_step: 5,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const INITIAL_SUBMISSIONS: PrayerSubmission[] = [];

