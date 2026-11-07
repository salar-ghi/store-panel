# Access API contract

The frontend uses the existing external REST API. No new backend has been provisioned.

- `POST /api/User/roles`: `{ name, permissions: ["catalog.products.read", "inventory.inputs.write"] }`.
- `POST /api/User/users`: existing user fields, `roleIds`, `isAdmin`, and `permissions: string[]`. Non-administrators send an empty direct-permission array.
- `GET /api/User/roles` and user list/detail responses must return saved permissions. Existing global action strings remain legacy; do not silently expand them to every module.
- Validate all keys against the catalog in `src/lib/access.ts`. Reject invalid keys. Require explicit grants for a new administrator; `isAdmin` alone must never grant unrestricted access.
- Only an authenticated actor with appropriate grant-management access may create roles or assign administrator access. Reject grants exceeding that actor's delegable permissions.
- Store roles, role assignments, and per-user grants separately from editable profile fields. Persist user creation and grants atomically.
- Enforce access on every endpoint, including feature actions. A denied request returns HTTP 403. These form controls are configuration, not a security boundary.
- The current frontend does not introduce route/action enforcement: server-issued effective permissions and an agreed legacy migration are needed before that can safely replace the existing token-only navigation.