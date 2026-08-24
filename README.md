# Grocery Planner

Smart grocery shopping planner with budget estimation, in-store checklist, and receipt reconciliation. Built as a PWA for offline-first supermarket use.

## Stack

- **React 19** + TypeScript 6 + Vite 8
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Effect** + `@effect/schema` — typed service layer with runtime validation
- **Base UI** (`@base-ui-components/react`) — accessible dialog, checkbox primitives
- **IndexedDB** (`idb`) — offline mutation queue for in-store use
- **vite-plugin-pwa** — service worker, manifest, offline support

## Features

| View | Purpose |
|---|---|
| **Login / Register** | Household-based auth with JWT |
| **Plan List** | Create and browse monthly shopping plans |
| **Plan Detail** | Add items from catalog, track budget with visual bar |
| **In-Store Checklist** | Tap-to-check items with offline queue + online sync |
| **Reconciliation** | Input actual prices from receipt, track variance vs estimate |

## Getting Started

```bash
# Install dependencies
bun install

# Dev server (proxies /api to localhost:8080)
bun run dev

# Production build
bun run build

# Lint
bun run lint
```

## Project Structure

```
src/
├── components/ui/       # button, input, modal, checkbox, progress, budget-bar, item-autocomplete
├── domain/              # Effect schemas (plan, catalog, auth)
├── hooks/               # use-auth (context + 401 handler), use-toast
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
- **Auth**: Token stored in localStorage with schema-validated deserialization on load. 401 responses trigger automatic logout.
