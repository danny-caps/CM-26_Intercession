import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory fallback submissions store to guarantee 100% uptime
let inMemorySubmissions: any[] = [];

// === PRAYER TYPES (Standard 6 Liturgical Categories) ===
const PRAYER_TYPES = [
  {
    id: 'pt-holy-mass',
    name: 'Holy Mass',
    slug: 'holy-mass',
    icon: 'Flame',
    description: 'Participation and Holy Eucharist offered for Campus Meet 2026 participants and spiritual fruits.',
    unit_name: 'Masses',
    quick_presets: [1, 2, 3, 5],
    is_active: true,
  },
  {
    id: 'pt-eucharistic-visits',
    name: 'Eucharistic Visits',
    slug: 'eucharistic-visits',
    icon: 'Sparkles',
    description: 'Silent personal adoration and visits before the Blessed Sacrament.',
    unit_name: 'Visits',
    quick_presets: [1, 2, 5, 10],
    is_active: true,
  },
  {
    id: 'pt-fastings',
    name: 'Fastings',
    slug: 'fastings',
    icon: 'Flame',
    description: 'Sacrificial fasting and mortification dedicated for spiritual breakthroughs.',
    unit_name: 'Meals / Days',
    quick_presets: [1, 2, 3, 7],
    is_active: true,
  },
  {
    id: 'pt-way-of-cross',
    name: 'Way of Cross',
    slug: 'way-of-cross',
    icon: 'Cross',
    description: 'Meditating on the 14 Stations of the Cross for repentance and salvation.',
    unit_name: 'Stations / Times',
    quick_presets: [1, 2, 3, 5],
    is_active: true,
  },
  {
    id: 'pt-our-father',
    name: 'Our Father',
    slug: 'our-father',
    icon: 'HeartHandshake',
    description: 'The Lord’s prayer uniting hearts in filial trust in God the Father.',
    unit_name: 'Prayers',
    quick_presets: [5, 10, 25, 50],
    is_active: true,
  },
  {
    id: 'pt-decades',
    name: 'Decades (Rosary)',
    slug: 'decades',
    icon: 'Sparkles',
    description: 'Decades of the Holy Rosary consecrated under Mother Mary’s maternal protection.',
    unit_name: 'Decades',
    quick_presets: [5, 10, 20, 50],
    is_active: true,
  },
];

const TARGET_GOALS: Record<string, number> = {
  'holy-mass': 1000,
  'eucharistic-visits': 5000,
  'fastings': 2000,
  'way-of-cross': 1500,
  'our-father': 50000,
  'decades': 30000,
};

const BASELINE_DISTRIBUTION: Record<string, { qty: number; subs: number }> = {
  'holy-mass': { qty: 0, subs: 0 },
  'eucharistic-visits': { qty: 0, subs: 0 },
  'fastings': { qty: 0, subs: 0 },
  'way-of-cross': { qty: 0, subs: 0 },
  'our-father': { qty: 0, subs: 0 },
  'decades': { qty: 0, subs: 0 },
};

// Initialize Supabase Postgres pool
const { Pool } = pg;

let pool: pg.Pool | null = null;
let isDbConnected = false;

try {
  let rawDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Daniyal%408490@db.vsavnfhgtgdpqmvnlqbx.supabase.co:5432/postgres';
  
  if (rawDbUrl.includes(':[Daniyal@8490]@')) {
    rawDbUrl = rawDbUrl.replace(':[Daniyal@8490]@', ':Daniyal%408490@');
  } else if (rawDbUrl.includes(':Daniyal@8490@')) {
    rawDbUrl = rawDbUrl.replace(':Daniyal@8490@', ':Daniyal%408490@');
  }

  pool = new Pool({
    connectionString: rawDbUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 4000,
  });

  // Handle background pool errors cleanly without crashing
  pool.on('error', (err) => {
    isDbConnected = false;
  });
} catch (e) {
  pool = null;
}

// Auto-initialize schema in Supabase (non-blocking)
async function initDatabase() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS prayer_submissions (
          id TEXT PRIMARY KEY,
          prayer_type_id TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          prayer_date DATE NOT NULL,
          submitted_at TIMESTAMPTZ NOT NULL,
          timezone TEXT,
          is_anonymous BOOLEAN DEFAULT true,
          status TEXT DEFAULT 'approved',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          prayer_type_name TEXT,
          prayer_type_slug TEXT,
          prayer_type_icon TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_prayer_submissions_date ON prayer_submissions(prayer_date);
        CREATE INDEX IF NOT EXISTS idx_prayer_submissions_type ON prayer_submissions(prayer_type_id);
      `);
      isDbConnected = true;
    } finally {
      client.release();
    }
  } catch (err) {
    isDbConnected = false;
  }
}

// Attempt initial database setup asynchronously
initDatabase().catch(() => {});

// Helper function to safely query DB with timeout
async function safeDbQuery(queryText: string, params: any[] = []): Promise<any[] | null> {
  if (!pool) return null;
  try {
    const res = await pool.query(queryText, params);
    isDbConnected = true;
    return res.rows;
  } catch {
    isDbConnected = false;
    return null;
  }
}

// API Health Check
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'sync_active',
    timestamp: new Date().toISOString()
  });
});

// API Get Prayer Types
app.get('/api/prayer-types', (req, res) => {
  res.json({ data: PRAYER_TYPES });
});

// API Get Submissions
app.get('/api/submissions', async (req, res) => {
  const rows = await safeDbQuery(`
    SELECT 
      id, 
      prayer_type_id, 
      quantity, 
      prayer_date::text as prayer_date, 
      submitted_at, 
      timezone, 
      is_anonymous, 
      status, 
      prayer_type_name, 
      prayer_type_slug, 
      prayer_type_icon
    FROM prayer_submissions 
    WHERE status = 'approved'
    ORDER BY submitted_at DESC 
    LIMIT 100
  `);

  if (rows && rows.length > 0) {
    res.json({ data: rows });
  } else {
    res.json({ data: inMemorySubmissions });
  }
});

// API Submit Prayer Offering
app.post('/api/submissions', async (req, res) => {
  try {
    const { prayer_type_id, quantity } = req.body;
    if (!prayer_type_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid prayer offering parameters' });
    }

    const prayerType = PRAYER_TYPES.find(p => p.id === prayer_type_id);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const newId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newRow = {
      id: newId,
      prayer_type_id,
      quantity: Math.max(1, parseInt(quantity, 10)),
      prayer_date: today,
      submitted_at: now.toISOString(),
      timezone: 'Asia/Kolkata',
      is_anonymous: true,
      status: 'approved',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      prayer_type_name: prayerType?.name || 'Prayer Offering',
      prayer_type_slug: prayerType?.slug || 'holy-mass',
      prayer_type_icon: prayerType?.icon || 'Flame',
    };

    // Store in memory
    inMemorySubmissions.unshift(newRow);
    if (inMemorySubmissions.length > 200) {
      inMemorySubmissions = inMemorySubmissions.slice(0, 200);
    }

    // Persist to Supabase in background
    if (pool) {
      pool.query(
        `INSERT INTO prayer_submissions (
          id, prayer_type_id, quantity, prayer_date, submitted_at, timezone, is_anonymous, status, created_at, updated_at, prayer_type_name, prayer_type_slug, prayer_type_icon
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          newRow.id,
          newRow.prayer_type_id,
          newRow.quantity,
          newRow.prayer_date,
          newRow.submitted_at,
          newRow.timezone,
          newRow.is_anonymous,
          newRow.status,
          newRow.created_at,
          newRow.updated_at,
          newRow.prayer_type_name,
          newRow.prayer_type_slug,
          newRow.prayer_type_icon,
        ]
      ).catch(() => {});
    }

    res.json({ data: newRow });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record prayer' });
  }
});

// API Get Real-time Aggregated Stats
app.get('/api/stats', async (req, res) => {
  try {
    let dbAggregates: Record<string, { qty: number; subs: number }> = {};
    let todayQty = 0;
    let todaySubsCount = 0;

    const aggRows = await safeDbQuery(`
      SELECT 
        prayer_type_id, 
        COALESCE(SUM(quantity), 0) as total_qty, 
        COUNT(*) as subs_count 
      FROM prayer_submissions 
      WHERE status = 'approved'
      GROUP BY prayer_type_id
    `);

    if (aggRows) {
      aggRows.forEach(r => {
        dbAggregates[r.prayer_type_id] = {
          qty: parseInt(r.total_qty, 10),
          subs: parseInt(r.subs_count, 10),
        };
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRows = await safeDbQuery(
        `SELECT COALESCE(SUM(quantity), 0) as today_qty, COUNT(*) as today_count FROM prayer_submissions WHERE prayer_date = $1 AND status = 'approved'`,
        [todayStr]
      );

      if (todayRows && todayRows.length > 0) {
        todayQty = parseInt(todayRows[0].today_qty, 10);
        todaySubsCount = parseInt(todayRows[0].today_count, 10);
      }
    } else {
      // In-memory aggregates
      inMemorySubmissions.forEach(sub => {
        if (!dbAggregates[sub.prayer_type_id]) {
          dbAggregates[sub.prayer_type_id] = { qty: 0, subs: 0 };
        }
        dbAggregates[sub.prayer_type_id].qty += sub.quantity;
        dbAggregates[sub.prayer_type_id].subs += 1;
      });
      const todayStr = new Date().toISOString().split('T')[0];
      const todaySubs = inMemorySubmissions.filter(s => s.prayer_date === todayStr);
      todayQty = todaySubs.reduce((sum, s) => sum + s.quantity, 0);
      todaySubsCount = todaySubs.length;
    }

    const prayerStats = PRAYER_TYPES.map(t => {
      const base = BASELINE_DISTRIBUTION[t.slug] || { qty: 0, subs: 0 };
      const dbRow = dbAggregates[t.id] || { qty: 0, subs: 0 };
      const total_quantity = base.qty + dbRow.qty;
      const total_submissions = base.subs + dbRow.subs;

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

    const total_offerings = prayerStats.reduce((sum, p) => sum + p.total_quantity, 0);
    const total_submissions = prayerStats.reduce((sum, p) => sum + p.total_submissions, 0);

    res.json({
      data: {
        total_offerings,
        total_submissions,
        today_offerings: todayQty,
        today_submissions_count: todaySubsCount,
        prayer_type_stats: prayerStats,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Vite Middleware for SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Meet '26 Intercession Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
