# Grocery Planner

Smart grocery shopping planner with budget estimation, in-store checklist, and receipt reconciliation. Built as a PWA for offline-first supermarket use.

## Stack

- **React 19** + TypeScript 6 + Vite 8
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Effect** + `@effect/schema` — typed service layer with runtime validation
- **Base UI** (`@base-ui-components/react`) — accessible dialog, checkbox primitives
- **IndexedDB** (`idb`) — offline mutation queue for in-store use
- **react-i18next** — internationalization (ID/EN), locale JSON files, pluralization

## Features

| View | Purpose |
|---|---|
| **Login / Register** | Better Auth email/password with secure cookie sessions |
| **Plan List** | Create and browse monthly shopping plans |
| **Plan Detail** | Add items from catalog, track budget with visual bar |
| **In-Store Checklist** | Tap-to-check items with offline queue + online sync |
| **Reconciliation** | Input actual prices from receipt, track variance vs estimate |

## Getting Started

```bash
# Install dependencies
bun install

# Dev server; Vite proxies /api to the local Worker at localhost:8787
bun run dev

# Production build
bun run build

# Lint
bun run lint
```

## Production routing

The frontend uses relative `/api/*` URLs. Production does not embed a backend URL in the frontend bundle. Cloudflare Pages serves `https://grocery.ibnua.li`, while the backend Worker owns the same-origin route `grocery.ibnua.li/api/*` through the route declared in `../backend-cf/wrangler.toml`.

Required Cloudflare setup:

1. Add `grocery.ibnua.li` as the Pages custom domain.
2. Ensure `ibnua.li` is an active Cloudflare zone and DNS is proxied.
3. Deploy the Worker from `../backend-cf`; Wrangler assigns the `/api/*` route.
4. Deploy the frontend `dist/` directory to Pages.
5. Keep `BETTER_AUTH_URL=https://grocery.ibnua.li` and `CORS_ORIGIN=https://grocery.ibnua.li` in the Worker production configuration.

The Vite proxy is development-only and never controls production traffic.

## Project Structure

```
src/
├── components/ui/       # button, input, modal, checkbox, progress, budget-bar, item-autocomplete
├── domain/              # Effect schemas (plan, catalog, auth)
├── i18n/                # i18next init, locales (id.json, en.json), format helpers
├── lib/                 # cn() utility (clsx + tailwind-merge)
├── services/            # api-client, auth-service, plan-service, catalog-service, queue-service, reconciliation-service
├── views/               # login-view, plan-list-view, plan-detail-view, in-store-view, reconciliation-view
├── app.tsx              # ErrorBoundary → ToastProvider → AuthProvider → AppContent
└── main.tsx             # Entry point
```

## Architecture Notes

- **Service layer**: All API calls go through `api-client.request()` which handles auth headers, 401 interception, and schema-validated responses via Effect.
- **Offline support**: `queue-service` stores check/uncheck mutations in IndexedDB. On reconnect, `flush()` replays them in order.
- **Error handling**: Render crashes caught by `error-boundary`; API failures surface via `use-toast()` notifications.
- **i18n**: All UI strings externalized to `src/i18n/locales/`. Default language is Indonesian. Language toggle in header and login page. Currency formatting via `formatCurrency()` helper.
