# Social Engagement Monitor

Internal MVP untuk monitor engagement konten TikTok, Instagram, dan YouTube.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Supabase)
- Recharts
- ScrapeCreators API (server-side only)

## Setup

1. Copy env file and fill values:

```bash
cp .env.example .env.local
```

Required:

- `DATABASE_URL` — Supabase Postgres connection string
- `SCRAPECREATORS_API_KEY` — API key ScrapeCreators (jangan expose ke client)
- `CRON_SECRET` — Bearer token untuk `/api/cron/refresh-snapshots`

Optional:

- `SCRAPER_SERVICE_URL` — reserved / legacy external scraper proxy

2. Install dependencies:

```bash
npm install
```

3. Push Prisma schema:

```bash
npm run db:push
```

4. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel

Set these Environment Variables in the Vercel project (Production + Preview):

- `DATABASE_URL` — gunakan **Session pooler** URI dari Supabase (port `5432`)
- `SCRAPECREATORS_API_KEY`
- `CRON_SECRET`

Build sudah menjalankan `prisma generate` via `postinstall` dan script `build`.

## API

- `POST /api/scrape` — `{ "url": "..." }` → scrape via ScrapeCreators, upsert `Content`, create `Snapshot`
- `GET /api/content` — list contents
- `POST /api/content` — create content metadata only
- `DELETE /api/content?id=...` — delete content
- `GET /api/content/[id]` — detail + snapshots
- `GET /api/cron/refresh-snapshots` — refresh semua content + insert snapshot baru (`Authorization: Bearer $CRON_SECRET`)

### Manual cron test

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/refresh-snapshots
```

### GitHub Actions

Workflow `.github/workflows/refresh-snapshots.yml` jalan tiap 6 jam + `workflow_dispatch`.
Set repo secrets:

- `APP_URL` — production base URL (tanpa trailing slash)
- `CRON_SECRET` — sama dengan env production

## Notes

- Instagram: `GET /v1/instagram/post`
- TikTok: `GET /v2/tiktok/video` (current ScrapeCreators docs)
- YouTube URL detection works; scrape returns clear 501 until endpoint is wired
- API key is only read in `lib/scraper.ts` on the server
