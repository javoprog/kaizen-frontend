# Kaizen frontend

The React client for Kaizen, a goal-first personal growth platform. This repository contains the production UI for the primary demo journey:

`Register → Onboard → Create goal → Review plan → Goal workspace → Complete task → Earn XP → Updated dashboard`

## Stack

- React 19 + TypeScript + Vite
- HeroUI v3 as the component system
- Motion for restrained interaction feedback
- Lucide icons
- React Flow for the interactive goal map
- Recharts for real activity trends

## Local development

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to the backend origin, without `/api`.
3. Install and run:

```bash
npm install
npm run dev
```

The default local frontend address is `http://localhost:5173`. The backend must allow that exact origin and credentials.

## Verification

```bash
npm run lint
npm run build
```

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Recommended | Public backend origin, for example `https://api.example.com`. If omitted, requests use the current origin. |

Vite variables are compiled into the client bundle and are public by design. Never place secrets in a `VITE_` variable.

## Coolify deployment

- Build command: `npm ci && npm run build`
- Static output directory: `dist`
- Configure `VITE_API_URL` before building.
- Route all SPA paths to `index.html` so direct goal-workspace URLs load correctly.

The backend is deployed independently. Both applications must use HTTPS in production for cross-site secure cookies.

## Product scope

The current implementation deliberately prioritizes the complete goal-to-progress loop. Profile, settings, habits, reviews, and analytics are clearly marked as unavailable rather than populated with fake data. They can be added without replacing the goal, milestone, task, or progression foundations.
