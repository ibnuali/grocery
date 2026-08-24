# Repository Guidelines

## Project Overview

Grocery Planner — a PWA for household grocery shopping with budget estimation, in-store checklist (offline-capable), and receipt reconciliation. Indonesian UI. Frontend for a Go/PostgreSQL backend API.

## Architecture & Data Flow

```
main.tsx → App.tsx (ErrorBoundary → ToastProvider → AuthProvider) → AppContent.tsx
                                                                        │
                                                          ┌─────────────┼─────────────┐
                                                          ▼             ▼             ▼
                                                     PlanListView  PlanDetailView  InStoreView
                                                          │             │             │
                                                          ▼             ▼             ▼
                                                     PlanService   CatalogService  QueueService (IndexedDB)
                                                          │             │
                                                          ▼             ▼
                                                     ApiClient.ts ← Effect.gen + @effect/schema decode
                                                          │
                                                          ▼
                                                     fetch() → /api/v1/* → Go backend (:8080)
```

- **Manual routing** via `useState<ActiveView>` in `AppContent.tsx` — no react-router.
- **Service layer**: every API call goes through `ApiClient.request()` which attaches JWT, decodes the response envelope with `@effect/schema`, and handles 401/network/decode errors as typed Effect failures.
- **Offline**: `QueueService` stores check/uncheck mutations in IndexedDB; replays on reconnect via `online` event.
- **Auth**: token + user + household stored in localStorage; schema-validated on load; 401 triggers auto-logout via registered callback.

## Key Directories

| Directory | Purpose |
|---|---|
| `src/views/` | 5 route-level views: Login, PlanList, PlanDetail, InStore, Reconciliation |
| `src/components/ui/` | Reusable primitives: Button, Input, Modal, Checkbox, Progress, BudgetBar, ItemAutocomplete |
| `src/services/` | API boundary (ApiClient), AuthService, PlanService, CatalogService, QueueService, ReconciliationService |
| `src/domain/` | Effect schemas: `auth.schema.ts`, `plan.schema.ts`, `catalog.schema.ts` |
| `src/hooks/` | `useAuth` (context + 401 handler), `useToast` (transient notifications) |
| `src/lib/` | `cn()` — clsx + tailwind-merge |
| `src/assets/` | Static images (hero.png, vite.svg, react.svg) |
| `public/` | favicon.svg, icons.svg |

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Vite dev server (proxies /api → localhost:8080)
bun run build        # tsc -b && vite build (production)
bun run lint         # oxlint
bun run preview      # Preview production build
```

No test runner, CI pipeline, or pre-commit hooks configured.

## Code Conventions & Common Patterns

### Naming
- **Files**: PascalCase for components/views (`PlanListView.tsx`), camelCase for services/hooks/utils (`PlanService.ts`, `useAuth.tsx`)
- **Exports**: named exports for components/services (`export const PlanListView`), default export only for `App.tsx`
- **Types**: Effect schemas define runtime types (`PlanItemSchema` → `type PlanItem`); no separate `.d.ts` files
- **CSS classes**: Tailwind utility-first; use `cn()` from `src/lib/utils.ts` for conditional/merged classes

### Effect / Service Pattern
```ts
// Services return Effect.Effect<Success, ErrorUnion> — never raw promises
export const PlanService = {
  getPlan: (id: string): Effect.Effect<ShoppingPlan, ApiError | NetworkError | DecodeError> =>
    request(`/api/v1/plans/${id}`, { method: 'GET' }, ShoppingPlanSchema),
}

// Views run effects with Effect.runPromise, catchAll for user-facing errors
const prog = PlanService.getPlan(id).pipe(
  Effect.map((plan) => setActivePlan(plan)),
  Effect.catchAll((err) => {
    toast('Gagal memuat data', 'error')
    return Effect.succeed(undefined)
  })
)
await Effect.runPromise(prog)
```

### Error Handling
- **Render crashes**: `ErrorBoundary` (class component) wraps the app
- **API failures**: `useToast()` for transient user notifications (auto-dismiss 4s)
- **401 responses**: `ApiClient` calls registered `onUnauthorized` → auto-logout
- **Offline mutations**: queued in IndexedDB, replayed on reconnect

### State Management
- React Context for auth (`useAuth`) and toasts (`useToast`)
- Local `useState` for view-level state — no global store
- `AppContent.tsx` holds the active view, selected plan ID, and active plan object

### Component Patterns
- `forwardRef` for UI primitives (Button, Input)
- Base UI (`@base-ui-components/react`) for accessible dialog/checkbox primitives
- Controlled components throughout (no uncontrolled forms)

### TypeScript
- `verbatimModuleSyntax` enforced — use `import type` for type-only imports
- `noUnusedLocals` + `noUnusedParameters` enforced
- `erasableSyntaxOnly` — no `enum`, no `namespace`
- No path aliases — relative imports only (`../services/PlanService`)

## Important Files

| File | Role |
|---|---|
| `src/main.tsx` | Entry point — mounts App in StrictMode |
| `src/App.tsx` | Composition root: ErrorBoundary → ToastProvider → AuthProvider → AppContent |
| `src/AppContent.tsx` | Authenticated shell + manual router + plan state coordination |
| `src/services/ApiClient.ts` | Centralized HTTP boundary with Effect, schema decode, 401 handling |
| `src/domain/*.schema.ts` | Runtime-validated types for all API payloads |
| `src/hooks/useAuth.tsx` | Auth context, login/register/logout, 401 auto-logout wiring |
| `vite.config.ts` | React + Tailwind + PWA plugins; /api proxy to :8080 |
| `tsconfig.app.json` | Application TypeScript config (ES2023, bundler, strict hygiene) |
| `.oxlintrc.json` | Lint rules: react hooks error, only-export-components warn |

## Runtime/Tooling Preferences

- **Runtime**: Bun (bun.lock present; no npm/yarn lockfiles)
- **Package manager**: `bun install` / `bun add`
- **Build**: TypeScript project references (`tsc -b`) then Vite bundle
- **Linting**: oxlint (not ESLint) — configured via `.oxlintrc.json`
- **Styling**: Tailwind CSS v4 via Vite plugin — no `tailwind.config.*` file; configured in CSS with `@import "tailwindcss"`
- **Backend**: Go API on `:8080` — Vite proxies `/api` in dev; expects `JWT_SECRET`, `DATABASE_URL`, `PORT`, `CORS_ORIGIN` env vars on backend side
- **No `.env` files** in frontend — no `import.meta.env` or `process.env` usage found

## Testing & QA

**No test infrastructure exists.** No test files, test frameworks, CI/CD pipelines, or pre-commit hooks.

Current quality gates:
- `bun run build` — TypeScript type-check + Vite production build
- `bun run lint` — oxlint static analysis

To add testing, the natural fit would be Vitest (same Vite config) + React Testing Library + Playwright for E2E.
