# Role-Based Access Control

Wayfinder separates platform administration from organization access. Payload
access functions are the authorization boundary; UI visibility alone never
grants or denies permission.

## Roles

| Capability | Platform admin | Owner | Manager | Member |
| --- | --- | --- | --- | --- |
| Manage platform records | Yes | No | No | No |
| Read every building in own organization | N/A | Yes | Yes | No |
| Create, update, and delete own-organization buildings (name, address, contact, logo) | N/A | Yes | Yes | No |
| Read a building explicitly assigned to them | N/A | Yes | Yes | Yes |
| Create, update, and delete map content (floors, objects, nodes, edges) in an accessible building | N/A | Yes | Yes | Yes, only on assigned buildings |
| Edit own organization's info (name, type, logo) | N/A | Yes | Yes | No |
| Read organization users | N/A | Yes | Yes | Only self |
| Create a user in own organization (role: manager or member) | N/A | Yes | Yes | No |
| Update or delete another non-owner user in own organization | N/A | Yes | Yes | No |
| Update own profile (name, avatar) | N/A | Yes | Yes | Yes |
| Change own role, organization, or building assignments | No | No | No | No |

`admins` are platform-team accounts and are not organization users. The
`owner`, `manager`, and `member` values belong only to authenticated `users`.
There is exactly one `owner` per organization, set at signup; no request path
(including this app's own user-management UI) can create or promote a second
owner.

## Scope rules

- Owners and managers implicitly access every building whose `organization`
  matches their user record, and may edit the building's own record (name,
  address, contact fields, logo).
- Members access only buildings listed in their `buildings` relationship.
  Unlike owners/managers, a member's access to *their own* building is
  read-only for the building's own record — they can view it, but only an
  owner or manager can rename it, change its contact info, or change its logo.
- All roles with access to a building (owner, manager, or an assigned member)
  get full create/update/delete on that building's map content — floors, map
  objects, map nodes, and path edges. Being assigned to a building is what
  grants working access to its content; there is no separate read-only tier
  for map content.
- Organization users cannot move buildings or map content between scopes.
  Relationship scope fields (`building` on map content, `organization` on
  buildings) are immutable through organization-user requests.
- A user cannot update their own `role`, `organization`, or `buildings`
  fields, and cannot delete or demote the organization's owner. An owner or
  manager can set `role`/`buildings` on any *other* non-owner user in their
  organization, and can create new manager/member users directly (see
  "Trusted user management" below).

## Enforcement

The reusable access functions live in `src/collections/access/index.ts`.
Creation checks proposed relationship values, while update and delete checks
return query constraints against the existing document. This distinction
prevents a caller from gaining access to an out-of-scope record by submitting
an in-scope replacement value.

Collection rules are applied to `buildings`, `floors`, `map-objects`,
`map-nodes`, `path-edges`, `organizations`, `users`, and `invitations`. The
`users` collection additionally uses field-level update restrictions on
`role`, `organization`, `buildings`, and `blocked` — `organization` stays
platform-admin-only (reassigning a user's org isn't supported); `role`/
`buildings`/`blocked` allow an owner/manager to set them on someone else, via
`canManageOrgUserFields`, while the same fields stay locked when a user
updates their own record (`userUpdate` grants self-update at the document
level, but the field-level check still blocks self-escalation and
self-blocking). `invitations` itself is create/read only for an owner/manager
in their own organization (`invitationCreate`/`invitationRead`); `update`/
`delete` are `noOne`, since an invitation is only ever mutated through the
resend/revoke/accept actions, never edited directly.

## Trusted user management

Implemented in `src/features/user-management/` (`/dashboard/users`, owner/
manager only): a role-grouped directory (owner/managers/members) plus a
per-user detail page at `/dashboard/users/[id]` for changing a non-owner
user's role or building assignment, blocking/unblocking their sign-in
access, viewing their invite history, and removing them from the
organization. Every mutation goes through the Local API with the real
authenticated user and `overrideAccess: false`, so it is authorized by the
same `userCreate`/`userUpdate`/`userDelete`/`canManageOrgUserFields`
functions described above — not by a bespoke check in the action layer. A
blocked user is rejected at sign-in by a `beforeLogin` collection hook
(`blockLoginHook`), not by an access-control read/write rule.

Adding a teammate is now a real email invitation, implemented in
`src/features/invitations/` (see `docs/technical/USER_INVITATIONS.md`) — the
owner/manager no longer sets an initial password directly. The invitee
proves ownership of their email by opening the invite link and choosing
their own password; the invite token is stored only as a sha256 hash
(`invitations.tokenHash`) and is single-use, expiring after 7 days.
