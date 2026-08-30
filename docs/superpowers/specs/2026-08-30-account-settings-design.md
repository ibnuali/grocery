# Account Settings Design

**Status:** Approved for implementation

## Goal

Provide authenticated users with an in-app way to update their display name and change their password without leaving the Grocery Planner session.

## Scope

Included:

- Safe current-user profile retrieval and display-name update.
- Password change requiring the current password, a new password, and UI confirmation.
- Session-scoped authorization, validation, localized feedback, and immediate frontend user-state refresh.
- Indonesian and English settings UI integrated with the existing authenticated navigation.

Excluded:

- Email changes, email verification, account deletion, MFA, password recovery, social providers, and household membership management.
- User IDs supplied by clients for account mutations.
- Direct password-hash access or custom authentication/session mechanisms.

## Architecture

The Cloudflare backend adds an authenticated account boundary under `/api/v1/account`:

- `GET /profile` returns the session user's safe profile.
- `PATCH /profile` accepts `{ name }`, trims and validates it, and updates only the session user.
- `POST /password` accepts `{ currentPassword, newPassword }`, validates the new password, and delegates credential verification/change to the pinned Better Auth API.

All responses use the existing `{ success, data, error }` envelope. `requireAuth` supplies identity from the validated session. Password values are transient request/form data only and are never persisted, logged, or returned.

The frontend adds account schemas and service methods through the existing credentialed `request()` boundary. A `/settings` route is added to `AuthenticatedShell`, and the existing UserMenu Settings affordance navigates there. The settings view has independent profile and password forms, duplicate-submit guards, accessible labels, localized errors/success feedback, back navigation, and password clearing on success/unmount. A successful profile mutation updates both `useAuth` state and `grocery_user`.

## Data Flow

1. User opens Settings from the authenticated UserMenu.
2. The view renders the cached safe user and optionally loads the current safe profile.
3. Profile submission calls `PATCH /api/v1/account/profile`; success updates context/local cache and visible header name.
4. Password submission calls `POST /api/v1/account/password`; the server verifies current credentials and changes the password through Better Auth.
5. Password fields clear after success and when leaving the view; the existing session remains governed by Better Auth.

## Validation and Errors

- Display name is trimmed, non-empty, and bounded to 100 Unicode characters.
- New password must be at least 8 characters and follows the existing registration minimum policy; confirmation mismatch is a frontend validation error and is never sent.
- Unauthorized requests return the existing 401 envelope and trigger the current auto-logout behavior.
- Wrong current password returns a generic credential error without revealing sensitive authentication state.
- Form-level and field-level feedback is localized in Indonesian and English.

## Verification

- Backend focused tests cover authorization, session-user isolation, name validation, successful profile update, wrong-current-password failure, successful password change, session continuity, and omission of credential data.
- Frontend tests cover service request contracts, validation, successful user-cache update, password-field clearing behavior, and error mapping where the existing Bun test environment supports it.
- Run frontend lint, type check/build, backend targeted tests, and an authenticated browser smoke flow covering both forms.
