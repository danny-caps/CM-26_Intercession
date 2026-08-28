# Campus Meet '26 — Official Intercession Platform

> **"ENCOUNTER JESUS — I will pour out my Spirit on all people." (Acts 2:17)**  
> **Dates:** 18th – 21st September 2026 (Friday – Monday)  
> **Venue:** @Christ College of Engineering, Irinjalakuda, Kerala  
> **Presented by:** Jesus Youth Irinjalakuda Campus Ministry

A responsive intercession and prayer offering platform that unites college students across Kerala in prayer leading up to **Campus Meet '26**.

---

## Key Features

1. **Faithful Poster Visual Identity**:
   - Recreates the exact typography ("ENCOUNTER" in terracotta woodcut, "JESUS" in saffron orange with the golden sun dot), color palette, scripture badges, and Good Shepherd visual art from the official campaign poster.
2. **Real-time Live Prayer Wall**:
   - Live counters for **11 Catholic prayer categories** (Hail Mary, Our Father, Rosary Decades, Holy Mass, Eucharistic Visit, Confession, Eucharistic Adoration, Personal Prayer, Bible Reading, Fasting, Way of the Cross).
3. **Interactive Altar of Light Visualization**:
   - Interactive canvas visualizer where individual student prayers glow as sanctuary candles around the Campus Meet '26 cross emblem. Clicking any candle displays the campus and intention note.
4. **Prayer Submission Flow**:
   - Fast step increment counters (+1, +5, +10, +50, +100), campus selector, student name with privacy/anonymity toggle, date picker, optional intention, and spiritual confirmation animation.
5. **Campus Leaderboard ("Campuses United in Prayer")**:
   - Filterable by timeframe (*Today*, *This Week*, *This Month*, *Entire Journey*) and specific prayer categories, with detailed college coordinator profiles.
6. **Live Activity Stream & Journey Timeline**:
   - Privacy-respecting real-time feed and countdown timeline with spiritual milestones.
7. **Committee Admin Panel & Audit Trail**:
   - Comprehensive analytics, submissions management with correction audit logs (`CREATE`, `ADMIN_CORRECTION`, `DELETE`), campus management, prayer type configurations, and CSV export.
8. **Supabase & Local Synchronized Store**:
   - Full PostgreSQL migration schema (`/supabase/schema.sql`) with RLS policies, indexing, and aggregation RPC functions. Works seamlessly in both live Supabase mode and local preview mode.

---

## Supabase Database Setup

1. Copy `.env.example` to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
2. Open your Supabase Project SQL Editor and execute the migration script located in `/supabase/schema.sql`.
3. The migration will automatically create the tables (`users`, `campuses`, `prayer_types`, `prayer_submissions`, `prayer_audit_log`), enable Row Level Security, install indexes, create PostgreSQL RPC functions, and insert seed data for 10 Kerala colleges and all 11 prayer types.
