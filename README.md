# Sell4Me Frontend

Next.js frontend for the Sell4Me affiliate commerce platform.

## Design

- **Primary brand / nav / buttons:** `#0B3D2E`
- **Accent / CTA / interactive:** `#FF7A45`
- **Text:** `#16221C` (primary), `#5B6B63` (secondary)
- **Surfaces:** `#F6F5F1` (page), `#EBF2EE` (soft sections), `#072A20` (pressed / dark)
- Typography: Bricolage Grotesque (display) + Work Sans (body)

## Surfaces

| Area | Routes |
|------|--------|
| Marketing | `/` |
| Public shop | `/shop/[code]`, `/products/[id]`, `/stores/[id]`, `/cart`, `/checkout`, `/track-delivery` |
| Auth | `/auth/login`, `/auth/register`, `/auth/verify-email`, … |
| Merchant | `/merchant/*` |
| Partner | `/partner/*` |

## Stack notes

- **State / data:** Redux Toolkit + RTK Query (`store/`)
- **HTTP:** Axios (`lib/axios.ts` base query)
- Auth & cart mirrored into RTK slices from RTK Query matchers

## Setup

```bash
npm install
cp .env.local.example .env.local   # or use existing .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend origin used by Next rewrites (default `http://localhost:4000`) |
| `NEXT_PUBLIC_API_PROXY` | Browser proxy prefix (default `/backend`) |
| `NEXT_PUBLIC_APP_URL` | Frontend origin |

API calls go through Next.js rewrites (`/backend/api/*` → backend `/api/*`) so the browser stays same-origin.

## Backend pairing

Requires the Sell4Me NestJS API running (default port `4000`). Affiliate share URLs use `/shop/{code}`. Guest carts send `x-guest-session-id`. Login uses `x-include-tokens: true` and stores the Bearer token for dashboards.
