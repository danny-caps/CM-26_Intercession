-- ==============================================================================
-- CAMPUS MEET '26 — INTERCESSION PLATFORM
-- Jesus Youth Irinjalakuda Campus Ministry
-- PostgreSQL & Supabase Database Migration & Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    display_name TEXT,
    campus_id UUID,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'campus_admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CAMPUSES TABLE
CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    coordinator_name TEXT,
    coordinator_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRAYER TYPES TABLE
CREATE TABLE IF NOT EXISTS public.prayer_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Flame',
    unit_name TEXT NOT NULL DEFAULT 'prayers',
    default_step INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRAYER SUBMISSIONS TABLE (Every individual prayer offering)
CREATE TABLE IF NOT EXISTS public.prayer_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    prayer_type_id UUID NOT NULL REFERENCES public.prayer_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 100000),
    prayer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    optional_note TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    student_name TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'flagged')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRAYER AUDIT LOG
CREATE TABLE IF NOT EXISTS public.prayer_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL,
    user_id UUID,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'ADMIN_CORRECTION')),
    old_quantity INTEGER,
    new_quantity INTEGER,
    old_prayer_type TEXT,
    new_prayer_type TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_agent TEXT,
    reason TEXT
);

-- ==============================================================================
-- DATABASE INDEXES FOR FAST ANALYTICS & REALTIME QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_prayer_date ON public.prayer_submissions(prayer_date);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_submitted_at ON public.prayer_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_campus_id ON public.prayer_submissions(campus_id);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_prayer_type_id ON public.prayer_submissions(prayer_type_id);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_user_id ON public.prayer_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_campus_date ON public.prayer_submissions(campus_id, prayer_date);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_type_date ON public.prayer_submissions(prayer_type_id, prayer_date);
CREATE INDEX IF NOT EXISTS idx_prayer_submissions_campus_type ON public.prayer_submissions(campus_id, prayer_type_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_audit_log ENABLE ROW LEVEL SECURITY;

-- Campuses & Prayer Types: Public read-only, admin full access
CREATE POLICY "Campuses are viewable by everyone" ON public.campuses FOR SELECT USING (true);
CREATE POLICY "Prayer types are viewable by everyone" ON public.prayer_types FOR SELECT USING (true);

-- Prayer Submissions: Anyone can read aggregated / approved data, anyone (even guest students) can create
CREATE POLICY "Submissions viewable by public" ON public.prayer_submissions FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit prayers" ON public.prayer_submissions FOR INSERT WITH CHECK (true);

-- Users & Profiles
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ==============================================================================
-- POSTGRESQL AGGREGATION & RPC FUNCTIONS
-- ==============================================================================

-- 1. Get Overall Total Prayers & Submission Counts
CREATE OR REPLACE FUNCTION get_total_prayers()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_offerings', COALESCE(SUM(quantity), 0),
        'total_submissions', COUNT(id),
        'active_campuses', COUNT(DISTINCT campus_id)
    ) INTO result
    FROM public.prayer_submissions
    WHERE status = 'approved';
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get Campus Leaderboard with Filtering
CREATE OR REPLACE FUNCTION get_campus_leaderboard(timeframe_days INTEGER DEFAULT 0)
RETURNS TABLE (
    campus_id UUID,
    campus_name TEXT,
    location TEXT,
    coordinator_name TEXT,
    total_offerings BIGINT,
    submission_count BIGINT,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS campus_id,
        c.name AS campus_name,
        c.location,
        c.coordinator_name,
        COALESCE(SUM(ps.quantity), 0)::BIGINT AS total_offerings,
        COUNT(ps.id)::BIGINT AS submission_count,
        RANK() OVER (ORDER BY COALESCE(SUM(ps.quantity), 0) DESC) AS rank
    FROM public.campuses c
    LEFT JOIN public.prayer_submissions ps ON c.id = ps.campus_id 
        AND ps.status = 'approved'
        AND (timeframe_days = 0 OR ps.submitted_at >= (now() - (timeframe_days || ' days')::INTERVAL))
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.location, c.coordinator_name
    ORDER BY total_offerings DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get Prayer Type Statistics
CREATE OR REPLACE FUNCTION get_prayer_type_totals()
RETURNS TABLE (
    prayer_type_id UUID,
    name TEXT,
    slug TEXT,
    icon TEXT,
    description TEXT,
    total_quantity BIGINT,
    total_submissions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id AS prayer_type_id,
        pt.name,
        pt.slug,
        pt.icon,
        pt.description,
        COALESCE(SUM(ps.quantity), 0)::BIGINT AS total_quantity,
        COUNT(ps.id)::BIGINT AS total_submissions
    FROM public.prayer_types pt
    LEFT JOIN public.prayer_submissions ps ON pt.id = ps.prayer_type_id AND ps.status = 'approved'
    WHERE pt.is_active = true
    GROUP BY pt.id, pt.name, pt.slug, pt.icon, pt.description
    ORDER BY total_quantity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get Recent Activity Feed
CREATE OR REPLACE FUNCTION get_recent_activity(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    campus_name TEXT,
    prayer_type_name TEXT,
    prayer_type_slug TEXT,
    quantity INTEGER,
    student_label TEXT,
    submitted_at TIMESTAMPTZ,
    optional_note TEXT,
    is_anonymous BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        c.name AS campus_name,
        pt.name AS prayer_type_name,
        pt.slug AS prayer_type_slug,
        ps.quantity,
        CASE 
            WHEN ps.is_anonymous OR ps.student_name IS NULL OR ps.student_name = '' 
            THEN 'A student from ' || c.name 
            ELSE ps.student_name || ' (' || c.name || ')'
        END AS student_label,
        ps.submitted_at,
        ps.optional_note,
        ps.is_anonymous
    FROM public.prayer_submissions ps
    JOIN public.campuses c ON ps.campus_id = c.id
    JOIN public.prayer_types pt ON ps.prayer_type_id = pt.id
    WHERE ps.status = 'approved'
    ORDER BY ps.submitted_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Prayer Types (Catholic Campus Intercessory Offerings)
INSERT INTO public.prayer_types (name, slug, description, icon, unit_name, default_step) VALUES
('Hail Mary', 'hail-mary', 'Spiritual bouquets offered through Our Lady for the youth of Campus Meet ''26.', 'HeartHandshake', 'prayers', 10),
('Our Father', 'our-father', 'The Lord''s Prayer uniting campus hearts as one family in Christ.', 'Cross', 'prayers', 5),
('Rosary Decades', 'rosary-decades', 'Decades of the Holy Rosary meditating on the mysteries of salvation.', 'Disc', 'decades', 5),
('Holy Mass', 'holy-mass', 'The source and summit of Christian life offered for the participants and team.', 'Flame', 'Masses', 1),
('Eucharistic Visit', 'eucharistic-visit', 'Quiet visits to the Blessed Sacrament in campus chapels and parishes.', 'Church', 'visits', 1),
('Confession', 'confession', 'Sacrament of Reconciliation offered for spiritual renewal and inner healing.', 'Sparkles', 'sacraments', 1),
('Eucharistic Adoration', 'adoration', 'Hours and half-hours spent in silent intercession before Jesus in the Monstrance.', 'Sun', 'hours', 1),
('Personal Prayer', 'personal-prayer', 'Dedicated personal time in silence, supplication, and praise.', 'Clock', 'minutes', 15),
('Bible Reading', 'bible-reading', 'Chapters of Sacred Scripture meditated upon for light and wisdom.', 'BookOpen', 'chapters', 5),
('Fasting', 'fasting', 'Days or meals consecrated in self-denial and earnest intercession.', 'Coffee', 'meals', 1),
('Way of the Cross', 'way-of-the-cross', 'Meditating on the Passion of our Lord for campus souls and revival.', 'Compass', 'times', 1)
ON CONFLICT (slug) DO NOTHING;

-- Seed Campuses (Irinjalakuda & Kerala Jesus Youth Campuses)
INSERT INTO public.campuses (name, location, coordinator_name, coordinator_email) VALUES
('Christ College of Engineering', 'Irinjalakuda (Event Venue)', 'Jerin Paul', 'jerin.cce@campusmeet.org'),
('St. Joseph''s College', 'Irinjalakuda', 'Anitta Davis', 'anitta.stjoseph@campusmeet.org'),
('Sacred Heart College', 'Chalakudy', 'Rohan K. Jose', 'rohan.shc@campusmeet.org'),
('Sahrdaya College of Engineering & Technology', 'Kodakara', 'Alen Benny', 'alen.sahrdaya@campusmeet.org'),
('St. Thomas College', 'Thrissur', 'Joel Varghese', 'joel.stthomas@campusmeet.org'),
('Vimala College', 'Thrissur', 'Sneha George', 'sneha.vimala@campusmeet.org'),
('St. Aloysius College', 'Elthuruth', 'Nivin Thomas', 'nivin.aloysius@campusmeet.org'),
('Prajyoti Niketan College', 'Pudukad', 'Maria Joseph', 'maria.prajyoti@campusmeet.org'),
('MES Asmabi College', 'P. Vemballur', 'Deepak Joy', 'deepak.mes@campusmeet.org'),
('Christ University Campus', 'Bangalore / Kerala Region', 'Kevin Mathew', 'kevin.christ@campusmeet.org')
ON CONFLICT (name) DO NOTHING;
