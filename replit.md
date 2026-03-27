# PAIS — Pakistan Accountability Intelligence System

## Overview
A full-stack accountability intelligence platform cross-referencing Pakistani government databases to detect corruption patterns using mathematical risk scoring (0-100%). Built for journalists and anti-corruption watchdogs.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + ShadCN, monorepo at `artifacts/pakistan-accountability/`
- **Backend**: Express + TypeScript at `artifacts/api-server/`, port 8080
- **Database**: PostgreSQL via Drizzle ORM, workspace `lib/db/`
- **Scripts**: Seed scripts at `scripts/`
- **Deploy**: cPanel packaging guide at `deploy/cpanel/README.md`

## Features

### Core Pages
- `/` — Dashboard: risk overview, trending alerts, top-risk officials
- `/parties` — Party breakdown with officials risk tables (all major parties: PML-N, PPP, PTI, MQM-P, etc.)
- `/officials` — Searchable table of 25 officials with risk badges
- `/officials/:id` — Official detail: SVG connection map, Gemini AI summary, risk factor bars, funding chart
- `/risk-scores` — Risk scoring methodology explained
- `/alerts` — Live alert feed (16+ alerts seeded)
- `/databases` — Data sources info page

### Toshakhana Registry (`/toshakhana`)
- 42 historical records (2002-2023) seeded from Kaggle/Cabinet Division data
- Stats: total value (PKR 98.7 Cr), retention rate (93%), top recipient
- Highest value gifts widget, year/name filter, full searchable table

### Live Scrapers (`/scrapers`) — Agent Alpha
- 6 scraper targets: National Assembly, OpenParliament (NA/Sindh/KPK/Senate), Punjab Assembly
- Run individual or full sweep with live log display
- Auto-refreshes every 5 seconds when running
- Scraper log history persisted in DB

### AI Integration
- Gemini 1.5 Flash (`GOOGLE_API` secret) generates natural language risk summaries
- Route: `/api/officials/:id/summary`

## Database Tables
- `officials` — 25 seeded officials across all major parties
- `alerts` — 16 seeded alerts
- `databases` — data sources registry
- `risk_scores` — risk scoring records
- `toshakhana_history` — 42 Toshakhana records (2002-2023)
- `scraped_members` — live scraped parliament members
- `scraper_logs` — scraper run history

## Scraper Infrastructure
- `artifacts/api-server/src/routes/scraper.ts` — axios+cheerio scrapers
- POST `/api/scraper/run` with `{ target: "na"|"sindh"|"kpk"|"senate"|"punjab"|"openparliament_na"|"all" }`
- GET `/api/scraper/logs` — scraper run history
- GET `/api/scraper/members` — scraped member records
- Note: .gov.pk sites may block Replit IPs; scrapers work best from VPS/cPanel server

## cPanel Deployment
See `deploy/cpanel/README.md` for 3 deployment methods:
1. cPanel Node.js Selector (recommended for modern hosts)
2. PHP proxy + VPS backend
3. Static frontend export (React only, API stays on Replit)

Cron job script: `deploy/cpanel/cron-scraper.js` for automated daily scraping.

## Seeding
```bash
pnpm --filter @workspace/scripts run seed-pakistan    # 25 officials, 16 alerts
pnpm --filter @workspace/scripts run seed-toshakhana  # 42 Toshakhana records
pnpm --filter @workspace/db run push-force             # Push DB schema changes
```

## Key Files
- `artifacts/pakistan-accountability/src/App.tsx` — Routes
- `artifacts/pakistan-accountability/src/components/layout.tsx` — Sidebar nav (8 links)
- `artifacts/pakistan-accountability/src/pages/official-detail.tsx` — AI summary + SVG ConnectionMap
- `artifacts/pakistan-accountability/src/pages/toshakhana.tsx` — Toshakhana registry
- `artifacts/pakistan-accountability/src/pages/scraper.tsx` — Scraper admin
- `artifacts/api-server/src/routes/scraper.ts` — Scraper backend
- `lib/db/src/schema/toshakhana.ts` — Toshakhana + scraped_members + scraper_logs tables

## Environment Secrets
- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_API` or `GOOGLE_API_KEY` — Gemini AI API key

## Risk Scoring
Scores are 0-100% calculated from: undeclared assets, PPRA contract anomalies, cross-database flags, network connections, wealth disparity. Never uses "corrupt" or "suspect" language — only mathematical risk indicators.

## UI Design
- Dark theme: `bg-background` (#0a0a0e), green primary (#22c55e)
- Risk colors: low=green, medium=yellow, high=orange, critical=red
- "scanline" CSS overlay for terminal aesthetic
- ForceGraph2D is NOT used — replaced with custom SVG ConnectionMap
