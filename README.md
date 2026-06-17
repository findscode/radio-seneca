# Radio Seneca

Internet radio web application: **AzuraCast** (broadcasting) + **Strapi** (schedule CMS) + **React** (listener UI).

AzuraCast is an external service — it is not bundled in this repo. For local development the web app uses [demo.azuracast.com](https://demo.azuracast.com) by default.

## Architecture

- **AzuraCast** — audio stream, AutoDJ, live DJs, Now Playing metadata (SSE)
- **Strapi** — weekly program schedule (`Show`, `ScheduleSlot`)
- **React** — player, Now Playing, schedule grid, live/AutoDJ show matching

## Project structure

```
radio-seneca/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── cms/          # Strapi 5 CMS
├── packages/
│   └── shared/       # Shared TypeScript types
└── infra/            # Docker, nginx, deployment
```

## Quick start (local dev)

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
npm run build --workspace=@radio-seneca/shared
```

### Run frontend (uses demo.azuracast.com by default)

```bash
cp apps/web/.env.example apps/web/.env
npm run dev:web
```

Open http://localhost:5175

> **Note:** The web dev server runs on port **5175** (not 5173). Strapi's admin HMR WebSocket uses port 5173 in development.

### Run Strapi CMS (SQLite, no Docker)

```bash
cp apps/cms/.env.example apps/cms/.env
npm run dev:cms:local
```

Admin panel: http://localhost:1337/admin

On first bootstrap, Strapi enables public read permissions for schedule APIs. Add shows and slots in the admin panel.

### Run full stack with Docker

Requires Docker for PostgreSQL + Strapi + web:

```bash
cp infra/.env.example infra/.env
# Edit infra/.env with your secrets and AzuraCast URL

cd infra
docker compose up --build
```

- Web UI: http://localhost:8080
- Strapi: http://localhost:1337

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_AZURACAST_URL` | AzuraCast base URL | `https://demo.azuracast.com` |
| `VITE_STATION_ID` | Station ID | `1` |
| `VITE_STRAPI_URL` | Strapi API URL (dev) | `http://localhost:1337` |
| `DATABASE_CLIENT` | Strapi DB (`sqlite` or `postgres`) | `sqlite` for local |
| `AZURACAST_UPSTREAM` | nginx proxy target (prod) | — |
| `STRAPI_UPSTREAM` | nginx Strapi upstream (prod) | `http://strapi:1337` |

In production builds, the web app uses same-origin proxied routes for AzuraCast (`/api/live`, `/api/nowplaying`, `/listen`, `/radio`) and Strapi (`/api/*`) — no CORS issues.

## DigitalOcean deployment

Recommended: **two droplets**.

### Droplet 1 — AzuraCast (broadcast)

1. Create Ubuntu 22.04 droplet (4 GB RAM minimum recommended).
2. Install AzuraCast: https://www.azuracast.com/docs/getting-started/installation/
3. Create station, configure AutoDJ + streamer accounts.
4. Note `listen_url`, station ID, and public URL.

### Droplet 2 — Radio Seneca app (web + Strapi)

1. Create Ubuntu 22.04 droplet (2 GB RAM).
2. Install Docker + Docker Compose.
3. Clone this repo and configure `infra/.env`:

```env
VITE_AZURACAST_URL=https://radio.yourdomain.com
VITE_STATION_ID=1
AZURACAST_UPSTREAM=https://radio.yourdomain.com
POSTGRES_PASSWORD=<strong-password>
APP_KEYS=<random>,<random>
API_TOKEN_SALT=<random>
ADMIN_JWT_SECRET=<random>
TRANSFER_TOKEN_SALT=<random>
JWT_SECRET=<random>
```

4. Deploy:

```bash
cd infra
docker compose up -d --build
```

5. Point DNS `radio.yourdomain.com` → droplet 2 IP.
6. Add TLS with Caddy or Certbot in front of port 8080.

### Post-deploy checklist

- [ ] Create Strapi admin user on first visit to `/admin`
- [ ] Verify schedule API: `GET /api/schedule-slots?populate=show`
- [ ] Match live DJ `streamer_name` in AzuraCast with `hostName` in Strapi slots
- [ ] Test audio playback and Now Playing updates
- [ ] Test SSE via nginx: `/api/live/nowplaying/sse`

## Development notes

- Vite dev server (port **5175**) proxies AzuraCast routes: `/api/live`, `/api/nowplaying`, `/listen`, `/radio`.
- Audio streams use same-origin paths in dev to avoid CORS.
- `ScheduleMatcher` links live DJs to schedule slots by `hostName` / `streamer_name`.
- Use `npm run dev:cms:local` for SQLite; use Docker Postgres for production-like CMS dev.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start React dev server (port 5175) |
| `npm run dev:cms:local` | Start Strapi with SQLite |
| `npm run dev:cms` | Start Strapi (uses `DATABASE_CLIENT` from `.env`) |
| `npm run test:web` | Run web unit tests |
| `npm run build` | Build shared + web |
| `npm run build:cms` | Build Strapi admin |
