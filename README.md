# Radio Seneca

Internet radio web application: **AzuraCast** (broadcasting) + **Strapi** (schedule CMS) + **React** (listener UI).

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

Open http://localhost:5173

### Run Strapi CMS

```bash
cd apps/cms
npm run develop
```

Admin panel: http://localhost:1337/admin

On first bootstrap, Radio Seneca seeds a weekly schedule and enables public read permissions for schedule APIs.

### Run full stack with Docker

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
| `AZURACAST_UPSTREAM` | nginx proxy target (prod) | — |
| `STRAPI_UPSTREAM` | nginx Strapi upstream (prod) | `http://strapi:1337` |

In production builds, the web app uses same-origin `/api/*` routes proxied by nginx (no CORS issues with AzuraCast SSE).

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

- Vite dev server proxies `/api/live` and `/api/nowplaying` to AzuraCast.
- `ScheduleMatcher` links live DJs to schedule slots by `hostName` / `streamer_name`.
- Strapi seeds 5 shows × 7 days on first run (empty database only).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start React dev server |
| `npm run dev:cms` | Start Strapi dev server |
| `npm run build` | Build shared + web |
| `npm run build:cms` | Build Strapi admin |
