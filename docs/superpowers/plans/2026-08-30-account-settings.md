# Account Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add session-scoped display-name updates and current-password-verified password changes through the Cloudflare backend and authenticated Grocery Planner frontend.

**Architecture:** The backend owns account identity, validation, Better Auth mutations, and the standard response envelope under `/api/v1/account`. The frontend consumes that boundary through the existing Effect-based API client, adds a `/settings` route, and updates the cached authenticated user after a successful name change. Password confirmation remains UI-only and password values never enter local storage.

**Tech Stack:** Hono, Better Auth 1.7.1, Drizzle, Effect, React 19, React Router 7, `@effect/schema`, i18next, Bun test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-account-settings-design.md`

## Global Constraints

- Account mutations derive identity only from `requireAuth`; no request body user ID.
- Display names are trimmed, non-empty, and at most 100 Unicode characters.
- New passwords are at least 8 characters; confirmation mismatch is client-side only.
- Passwords are transient form/request data and are never logged, persisted, returned, or included in errors.
- API responses use `{ success, data, error }` and the existing frontend `request()` decoder.
- Preserve existing session behavior after password changes; do not revoke sessions unless Better Auth’s default operation requires it.
- Keep `.env.example` unchanged; it is pre-existing user work.

---

### Task 1: Backend account contract and validation tests

**Files:**
- Create: `../backend-cf/src/controllers/account.ts`
- Create: `../backend-cf/src/routes/account.ts`
- Modify: `../backend-cf/src/middleware/auth.ts`
- Modify: `../backend-cf/src/app/context.ts`
- Create: `../backend-cf/test/account.test.ts`

**Interfaces:**
- Produces protected routes mounted as `/api/v1/account` with `GET /profile`, `PATCH /profile`, and `POST /password`.
- `requireAuth` places the Better Auth session user in `c.get("user")` in addition to `c.get("userId")`.
- Controller helpers expose `parseProfileName`, `parsePasswordChange`, and `toSafeUser` for deterministic unit tests.

- [ ] **Step 1: Confirm installed Better Auth method signatures**

From `../backend-cf`, run `bun install` if dependencies are absent. Inspect the pinned `better-auth@1.7.1` declarations/source for `auth.api.updateUser` and `auth.api.changePassword`. Confirm the request bodies and return values used by the controller; do not invent a second authentication path.

Run: `bun install` and `bunx tsc --noEmit` from `../backend-cf`.
Expected: the account-management methods are available and the baseline type check passes.

- [ ] **Step 2: Write failing backend validation and sanitization tests**

Add Bun tests using the real exported helpers:

```ts
test("rejects blank and overlong profile names", () => {
  expect(() => parseProfileName({ name: "   " })).toThrow("name is required");
  expect(() => parseProfileName({ name: "a".repeat(101) })).toThrow("at most 100");
});

test("normalizes valid profile names", () => {
  expect(parseProfileName({ name: "  Ada Lovelace  " })).toBe("Ada Lovelace");
});

test("does not expose credential fields", () => {
  expect(toSafeUser({ id: "u1", name: "Ada", email: "a@example.com", password: "secret" })).toEqual({
    id: "u1", name: "Ada", email: "a@example.com"
  });
});

test("rejects short passwords without echoing their value", () => {
  expect(() => parsePasswordChange({ currentPassword: "current", newPassword: "short" })).toThrow("at least 8");
});
```

- [ ] **Step 3: Run the focused tests and verify the expected red failure**

Run: `bun test test/account.test.ts` from `../backend-cf`.
Expected: FAIL because the account helpers do not exist yet, not because of malformed test code.

---

### Task 2: Implement protected backend account API

**Files:**
- Modify: `../backend-cf/src/app.ts`
- Modify: `../backend-cf/src/middleware/auth.ts`
- Modify: `../backend-cf/src/app/context.ts`
- Modify: `../backend-cf/src/lib/errors.ts`
- Create: `../backend-cf/src/routes/account.ts`
- Create: `../backend-cf/src/controllers/account.ts`
- Modify: `../backend-cf/test/account.test.ts`

**Interfaces:**
- `GET /api/v1/account/profile` returns `{ success: true, data: { id, name, email, created_at? } }` from the authenticated session user.
- `PATCH /api/v1/account/profile` accepts only `{ name }`, updates the session user with `auth.api.updateUser`, and returns the safe user shape.
- `POST /api/v1/account/password` accepts `{ currentPassword, newPassword }`, calls `auth.api.changePassword({ body: { currentPassword, newPassword }, headers: c.req.raw.headers })`, and returns `{ success: true, data: { changed: true } }`.

- [ ] **Step 1: Implement pure parsing and safe-user projection**

Use the repository’s `parseJsonObject`, `requiredString`, and `RequestValidationError`. Profile parsing must trim and enforce the 100-character limit. Password parsing must require both strings, enforce the 8-character minimum, and never put a password into an exception message. `toSafeUser` must explicitly select safe fields and map `createdAt` to `created_at`.

- [ ] **Step 2: Preserve the authenticated session user in middleware context**

Update `requireAuth` to set `userId` and the safe session user from its single `getSession` result. Extend `Variables` with the inferred Better Auth session-user type or an equivalent safe structural type. Keep the existing unauthenticated response unchanged.

- [ ] **Step 3: Implement controller operations and error mapping**

Use the existing `Effect` and response-helper patterns. Profile reads return the middleware user. Profile updates call Better Auth with the incoming request headers and return the safe updated user. Password changes delegate current-password verification and update to Better Auth. Map a current-password failure to `INVALID_PASSWORD` with a generic message; map malformed input to `VALIDATION_ERROR`; do not expose Better Auth internals or password values.

- [ ] **Step 4: Mount the protected account route**

Create a Hono route with `use("*", requireAuth)` and mount it at `/api/v1/account` in `createApp()`. Keep `/api/auth/**`, plans, catalog, health, CORS, and not-found behavior unchanged.

- [ ] **Step 5: Extend backend tests for route contracts**

Add tests for the standard response shapes using a controlled account controller/auth boundary, including safe profile output, profile update input, password success result, generic wrong-password error, and rejection when no authenticated user is present. Assert that responses contain no `password`, `currentPassword`, or `newPassword` keys.

- [ ] **Step 6: Run backend focused tests and type check**

Run: `bun test test/account.test.ts` and `bunx tsc --noEmit` from `../backend-cf`.
Expected: PASS with no credential data in response assertions; type check passes.

---

### Task 3: Frontend account service contract tests

**Files:**
- Create: `src/lib/account-validation.ts`
- Create: `src/lib/account-validation.test.ts`
- Create: `src/services/account-service.test.ts`
- Modify: `package.json`

**Interfaces:**
- `validateProfileName(name: string): "required" | "tooLong" | undefined`.
- `validatePasswordChange(currentPassword: string, newPassword: string, confirmation: string): "currentRequired" | "newRequired" | "tooShort" | "mismatch" | undefined`.
- `AccountService.getProfile()`, `.updateProfile(name)`, and `.changePassword(currentPassword, newPassword)` return Effect values through `request()`.

- [ ] **Step 1: Add the frontend Bun test script and write failing validation tests**

Add `"test": "bun test"` to `package.json`. Write tests for blank/trimmed/100-character profile names, 101-character rejection, missing current/new passwords, short new passwords, matching confirmation, and mismatched confirmation. Assert the exact validation discriminants above.

- [ ] **Step 2: Run validation tests and verify the expected red failure**

Run: `bun test src/lib/account-validation.test.ts` from the frontend repository.
Expected: FAIL because the validation module does not exist yet.

- [ ] **Step 3: Write failing service request-contract tests**

Stub only `globalThis.fetch` at the network boundary and provide a minimal in-memory `localStorage` for the test process. Assert that the methods call `/api/v1/account/profile` with `GET`/`PATCH` and `{ name }`, and `/api/v1/account/password` with `POST` and `{ currentPassword, newPassword }`; assert that the Effect resolves the decoded data from the standard envelope. Do not assert internal helper calls.

- [ ] **Step 4: Run service tests and verify the expected red failure**

Run: `bun test src/services/account-service.test.ts`.
Expected: FAIL because `AccountService` does not exist yet.

---

### Task 4: Implement frontend account schemas and service

**Files:**
- Modify: `src/domain/auth.schema.ts`
- Create: `src/domain/account.schema.ts`
- Create: `src/lib/account-validation.ts`
- Create: `src/services/account-service.ts`
- Modify: `src/services/account-service.test.ts`

**Interfaces:**
- `SafeUserSchema` reuses the existing `UserSchema` shape without credential fields.
- `PasswordChangeResultSchema` decodes `{ changed: true }`.
- `AccountService` exposes `getProfile`, `updateProfile`, and `changePassword` with the repository’s `ApiError | NetworkError | DecodeError` failure union.

- [ ] **Step 1: Implement the minimal validation module**

Trim only for validation/result use; return discriminants rather than translated strings so the view can use i18next. Enforce 100 characters for profile names and 8 characters for new passwords. Keep confirmation out of the service request.

- [ ] **Step 2: Implement account response schemas**

Define the safe profile and password-result schemas using `@effect/schema` and existing `UserSchema` composition. Do not define or decode password properties.

- [ ] **Step 3: Implement Effect-based account service methods**

Use `request("/api/v1/account/profile", ...)` for profile operations and `request("/api/v1/account/password", ...)` for password changes. JSON bodies must use the backend field names exactly. The service must not write to local storage; auth context owns user-cache updates.

- [ ] **Step 4: Run focused frontend tests and type check**

Run: `bun test src/lib/account-validation.test.ts src/services/account-service.test.ts` and `bunx tsc -b` from the frontend repository.
Expected: PASS with all requests decoded through the standard envelope and no TypeScript errors.

---

### Task 5: Build settings state, route, and navigation

**Files:**
- Modify: `src/hooks/use-auth.tsx`
- Modify: `src/components/authenticated-shell.tsx`
- Modify: `src/components/user-menu.tsx`
- Create: `src/views/settings-view.tsx`
- Modify: `src/lib/routes.ts`

**Interfaces:**
- `useAuth().updateUser(user: User): void` replaces React state and `grocery_user` with the safe returned profile.
- `UserMenu` receives `onSettings: () => void` and closes the menu before invoking it.
- `SettingsView` receives `user: User`, `onUserUpdated: (user: User) => void`, and `onBack: () => void`.

- [ ] **Step 1: Add the failing navigation/state test seam**

Extend the existing service-level tests with a pure assertion that a successful profile response can replace the cached safe user while leaving no password property. Keep this test at the auth-state boundary, not on React implementation details.

- [ ] **Step 2: Implement auth user-cache replacement**

Add `updateUser` to the auth context. It must call `setUser` and serialize only the returned `User` to `grocery_user`; it must never accept or store password fields. Keep login/register/logout behavior unchanged.

- [ ] **Step 3: Add the route and user-menu action**

Add `/settings` to the route constants if needed. Pass an `onSettings` callback from `AuthenticatedShell` to `UserMenu`, navigate from the menu action to `/settings`, and register a protected Settings route. Preserve the current authenticated path as a back target using React Router location state, with `/plans` as the fallback.

- [ ] **Step 4: Implement the independent settings forms**

Create `SettingsView` using existing `Input`, `Button`, `useAuth`, `AccountService`, `Effect.runPromise`, and `useTranslation`. Render the current name/email summary and two separate forms:

```tsx
<form onSubmit={handleProfileSubmit}>
  <Input label={t("settings.name")} value={name} ... />
  <Button type="submit" disabled={profilePending}>{...}</Button>
</form>
<form onSubmit={handlePasswordSubmit}>
  <Input type="password" autoComplete="current-password" ... />
  <Input type="password" autoComplete="new-password" ... />
  <Input type="password" autoComplete="new-password" ... />
  <Button type="submit" disabled={passwordPending}>{...}</Button>
</form>
```

Validate before requests, prevent duplicate submits, show localized field/form errors and `role="status"` success feedback, clear password state after success, and clear password state in the unmount cleanup. Do not use local storage for form state. Use inline styles and tokens consistent with existing authenticated views.

- [ ] **Step 5: Run type check and focused tests**

Run: `bun test src/lib/account-validation.test.ts src/services/account-service.test.ts` and `bunx tsc -b`.
Expected: PASS; settings route and callback types compile.

---

### Task 6: Add localized copy and verify the complete flow

**Files:**
- Modify: `src/i18n/locales/id.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/index.css` only if the settings layout needs a reusable responsive class
- Create or modify: no additional production files unless required by the smoke result

- [ ] **Step 1: Add Indonesian and English settings translations**

Add complete keys for page title/subtitle, profile section, password section, current/new/confirmation labels, save/change actions, success messages, required/too-short/too-long/mismatch errors, generic server errors, incorrect-current-password feedback, loading, and back navigation. Keep both locale trees structurally aligned.

- [ ] **Step 2: Run lint, tests, and production build**

Run from frontend: `bun test`, `bun run lint`, and `bun run build`.
Expected: all focused tests pass, lint has no new errors, and Vite production build succeeds.

Run from backend: `bun test` and `bunx tsc --noEmit`.
Expected: existing backend tests and account tests pass.

- [ ] **Step 3: Exercise the actual authenticated browser flow**

Start the frontend with `bun run dev` and the backend Worker with its existing dev command. In a browser, sign in, open UserMenu → Settings, rename the profile, confirm the header initials/name update without re-login, submit an incorrect current password and verify generic visible failure with fields retained, submit a valid password change and verify success plus cleared password fields, navigate away/back, and confirm the session still reaches an existing plan route. Check keyboard focus/order and responsive rendering.

- [ ] **Step 4: Inspect the final diff for scope and secret hygiene**

Confirm only account-settings source, tests, translations, spec/plan, and intended backend files changed. Confirm no password values appear in local storage, response bodies, logs, snapshots, or test output. Leave the pre-existing frontend `.env.example` modification untouched.
