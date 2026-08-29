import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();

app.use(express.json());

// === PRAYER TYPES (Standard 6 Liturgical Categories) ===
export const PRAYER_TYPES = [
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
    id: 'pt-creed',
    name: 'Creed',
    slug: 'creed',
    icon: 'BookOpen',
    description: 'The Apostles’ or Nicene Creed recited in profession of faith and spiritual steadfastness.',
    unit_name: 'Prayers',
    quick_presets: [1, 2, 5, 10],
    is_active: true,
  },
  {
    id: 'pt-memorare',
    name: 'Memorare',
    slug: 'memorare',
    icon: 'HeartHandshake',
    description: 'The ancient prayer to Our Lady invoking her continuous maternal protection and intercession.',
    unit_name: 'Prayers',
    quick_presets: [1, 2, 5, 10],
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

export const TARGET_GOALS: Record<string, number> = {
  'holy-mass': 1000,
  'eucharistic-visits': 5000,
  'creed': 2000,
  'memorare': 1500,
  'our-father': 50000,
  'decades': 30000,
};

// Global in-memory fallback submissions store to ensure resilience
let inMemorySubmissions: any[] = [];

// Initialize Supabase Postgres pool
let pool: pg.Pool | null = null;
let isDbConnected = false;

try {
  const PoolConstructor = pg.Pool || (pg as any).default?.Pool || pg;
  let rawDbUrl = process.env.DATABASE_URL || '';
  
  if (!rawDbUrl || !rawDbUrl.startsWith('postgres')) {
    // If DATABASE_URL is just the password or empty, use the full Supabase connection string
    rawDbUrl = 'postgresql://postgres:Daniyal%408490@db.vsavnfhgtgdpqmvnlqbx.supabase.co:5432/postgres';
  } else {
    // Ensure @ in the password part is safely encoded as %40 so hostname parsing doesn't break
    if (rawDbUrl.includes(':[Daniyal@8490]@')) {
      rawDbUrl = rawDbUrl.replace(':[Daniyal@8490]@', ':Daniyal%408490@');
    } else if (rawDbUrl.includes(':Daniyal@8490@')) {
      rawDbUrl = rawDbUrl.replace(':Daniyal@8490@', ':Daniyal%408490@');
    }
  }

  pool = new PoolConstructor({
    connectionString: rawDbUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 6000,
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL background pool error:', err);
    isDbConnected = false;
  });
} catch (err) {
  console.error('Failed to create PostgreSQL pool:', err);
  pool = null;
}

// Auto-initialize schema in Supabase if table doesn't exist
let isSchemaInitialized = false;
async function ensureDatabaseSchema() {
  if (!pool || isSchemaInitialized) return;
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
      isSchemaInitialized = true;
    } finally {
      client.release();
    }
  } catch (err) {
    isDbConnected = false;
  }
}

// Ensure schema on first boot
ensureDatabaseSchema().catch(() => {});

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

// Global SSE clients for instantaneous multi-user updates (supported on long-running servers)
const sseClients = new Set<express.Response>();

function broadcastEvent(type: string, payload: any) {
  const message = `data: ${JSON.stringify({ type, payload, timestamp: Date.now() })}\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat for SSE connections
setInterval(() => {
  for (const client of Array.from(sseClients)) {
    try {
      client.write(': ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// API Real-time SSE Stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// API Health Check
app.get('/api/health', async (_req, res) => {
  await ensureDatabaseSchema();
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'sync_active',
    active_listeners: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

// API Get Prayer Types
app.get('/api/prayer-types', (_req, res) => {
  res.json({ data: PRAYER_TYPES });
});

// API Get Submissions (Real-time shared canonical list)
app.get('/api/submissions', async (_req, res) => {
  await ensureDatabaseSchema();
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
    LIMIT 300
  `);

  if (rows !== null) {
    if (rows.length > 0) {
      inMemorySubmissions = rows;
    }
    res.json({ data: rows });
  } else {
    res.json({ data: inMemorySubmissions });
  }
});

// API Submit Prayer Offering (Persists to Postgres and broadcasts to all users)
app.post('/api/submissions', async (req, res) => {
  try {
    await ensureDatabaseSchema();
    const { prayer_type_id, quantity } = req.body;
    if (!prayer_type_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid prayer offering parameters' });
    }

    const prayerType = PRAYER_TYPES.find(p => p.id === prayer_type_id);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const newId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

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

    // Store in memory cache
    inMemorySubmissions.unshift(newRow);
    if (inMemorySubmissions.length > 300) {
      inMemorySubmissions = inMemorySubmissions.slice(0, 300);
    }

    // AWAIT persistence to Supabase PostgreSQL database
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO prayer_submissions (
            id, prayer_type_id, quantity, prayer_date, submitted_at, timezone, is_anonymous, status, created_at, updated_at, prayer_type_name, prayer_type_slug, prayer_type_icon
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity`,
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
        );
        isDbConnected = true;
      } catch (dbErr) {
        console.error('Error saving to PostgreSQL:', dbErr);
      }
    }

    // Broadcast update to real-time subscribers
    broadcastEvent('new_submission', newRow);

    res.json({ data: newRow });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record prayer' });
  }
});

// API Get Real-time Aggregated Stats
app.get('/api/stats', async (_req, res) => {
  try {
    await ensureDatabaseSchema();
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
      const dbRow = dbAggregates[t.id] || { qty: 0, subs: 0 };
      const total_quantity = dbRow.qty;
      const total_submissions = dbRow.subs;

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
