# User Invitations

Status: **designed, not implemented.** This doc specs out how an
owner/manager invites a teammate by email instead of setting their password
directly. No code has been written yet — this is the plan to build from.

## The gap this closes

`docs/security/RBAC.md` already flags this as missing, in its own words:

> Email invitations and self-service password reset for these created
> accounts are not implemented yet; the owner/manager sets the initial
> password and shares it with the new user directly.

That's exactly what happens today: `AddTeamMemberDialog` (see
`src/features/user-management/components/AddTeamMemberDialog.tsx`) collects
name/email/**password**/role/buildings, and
`CreateOrgUserSchema` (`src/features/user-management/validations/create-org-user.ts`)
requires that password to be typed in by the admin, min 8 characters. There's
no proof the invited person owns that email address, and the admin has to
invent and relay a password out of band.

This feature **replaces** that flow: the admin sends an invite instead of a
password, the invitee proves ownership of their email by clicking the link,
and picks their own password.

## Flow

```
Owner/Manager                    Server                          Invitee
     |                             |                                 |
     |--- name, email, role,   -->|                                 |
     |    buildings (if member)   | check: inviter permitted,       |
     |                            |   email not already a user,     |
     |                            |   no active invite for email    |
     |                            |                                 |
     |                            | generate token, store            |
     |                            | Invitation { tokenHash, ... }    |
     |                            |                                 |
     |                            |--- email: /invite/<token> --------------------------------->|
     |                            |                                 |
     |                            |<---------- GET /invite/<token> ------------------------------|
     |                            | validate: exists, not expired,  |
     |                            |   not accepted, not revoked     |
     |                            |--- email (read-only), name -->----------------------------->|
     |                            |    (editable), role (read-only) |
     |                            |                                 |
     |                            |<--- name, password, confirm ------------------------------- Join
     |                            | re-validate token                |
     |                            | create user, set _verified: true |
     |                            | mark invitation ACCEPTED          |
     |                            | sign the user in                  |
     |                            |--- redirect: /dashboard ------------------------------------>|
```

Concretely, adapted to this app's real roles (`owner`/`manager`/`member`,
`src/collections/constants/roles.ts`) and its multi-tenant model (every user
belongs to exactly one `organization`):

1. An owner or manager, from the user-management dashboard, enters a
   teammate's **name**, **email**, **role** (`manager` or `member` — never
   `owner`, same ceiling `access.userCreate` already enforces), and, if role
   is `member`, the **buildings** they should have access to.
2. Server checks, in order:
   - Inviter is `owner`/`manager` (existing access-control layer).
   - Inviting `manager` role is fine for anyone; no separate "can't invite
     higher than yourself" check is needed — see [Access control](#access-control).
   - No existing `users` doc has that email (Payload's `auth` config already
     enforces email uniqueness globally, so this is a plain `find`).
   - No `Invitation` for that email in this organization with status
     `PENDING` and `expiresAt` in the future.
3. Server generates a random token, hashes it, and creates an `Invitation`
   doc (`PENDING`) carrying the hash, not the raw token.
4. Server emails the invitee a link containing the **raw** token:
   `https://<serverUrl>/invite/<token>`.
5. Invitee opens the link.
6. Server looks the token up by hash and validates: exists, not expired
   (`expiresAt < new Date()`), `status === "PENDING"` (covers both "already
   accepted" and "revoked" — see [schema](#new-collection-invitations)).
7. Page renders: email (read-only, from the invitation doc — never trust a
   client-submitted email here), name (pre-filled, editable), role
   (read-only), password, confirm password, Join button.
8. On Join:
   - Re-validate the token server-side (don't trust that step 6's check is
     still true — someone could race two tabs, or the token could expire
     between page-load and submit).
   - Create the `users` doc: `email`/`role`/`organization`/`buildings` come
     from the **Invitation** record, not the form; `name`/`password` come
     from the form. Set `_verified: true` directly (Payload's built-in auth
     field — see [Email verification](#email-verification)).
   - Mark the `Invitation` `ACCEPTED`, set `acceptedAt`.
   - Sign the new user in (Payload's `login` local/REST operation).
   - Redirect to `/dashboard`.

## New collection: `Invitations`

The user's spec's generic schema, adapted with real Payload field types and
two additions this app specifically needs (`organization` — everything here
is org-scoped; `buildings` — a `member` invite has to carry its intended
building assignments through to acceptance, same as `CreateOrgUserSchema`
does today):

```ts
export const Invitations: CollectionConfig = {
  slug: "invitations",
  fields: [
    { name: "email", type: "email", required: true, index: true },
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      options: [
        { value: ROLES.MANAGER, label: "Manager" },
        { value: ROLES.MEMBER, label: "Member" },
      ], // never ROLES.OWNER — same ceiling as access.userCreate
    },
    {
      name: "organization",
      type: "relationship",
      relationTo: "organizations",
      required: true,
      index: true,
    },
    {
      name: "buildings",
      type: "relationship",
      relationTo: "buildings",
      hasMany: true,
      admin: { condition: (data) => data?.role === ROLES.MEMBER },
    },
    { name: "tokenHash", type: "text", required: true, unique: true, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "revoked", label: "Revoked" },
      ],
      index: true,
    },
    { name: "expiresAt", type: "date", required: true },
    { name: "acceptedAt", type: "date" },
    {
      name: "invitedBy",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
  ],
  access: {
    create: access.invitationCreate, // mirrors access.userCreate's org/role ceiling
    read: access.invitationRead,     // owner/manager, own organization only
    update: access.noOne,            // never edited directly — only revoke/accept via actions
    delete: access.noOne,
  },
};
```

No `EXPIRED` status, per the original spec — `expiresAt < new Date()` covers
it, checked wherever `status === "pending"` is checked. `updatedAt`/`createdAt`
are Payload's automatic timestamps, not declared fields.

## Access control

The spec's rule "managers must not invite users with permissions higher than
their own" needs **no new logic**. `access.userCreate`
(`src/collections/access/index.ts`) already restricts the `role` an
owner/manager can assign to `MANAGER` or `MEMBER`, never `OWNER` — that's
already the ceiling for every inviter, owner included, since nobody can
create a second owner through this path. `access.invitationCreate` should
apply the identical rule (organization must match the inviter's, role must
be `manager`/`member`) — same shape as `userCreate`, just against the
`invitations` collection instead of `users`.

## Token handling

- Generate a random raw token server-side (e.g. `crypto.randomBytes(32)`,
  hex/base64url-encoded).
- Store only `tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")`.
  Plain fast hashing is correct here — unlike a password, this token is
  already high-entropy and random, so there's no offline-guessing risk that
  would call for slow/adaptive hashing (bcrypt etc.).
- Send the **raw** token only in the email link. It's never stored.
- On validation, hash the incoming token and look up by `tokenHash` (indexed,
  `unique`).
- Single-use: acceptance flips `status` to `ACCEPTED` in the same operation
  that creates the user, so a replay of the same link fails the
  `status === "pending"` check.
- Expiry: propose **7 days**, matching the general lifetime used for
  `resetPasswordExpiration`-style flows elsewhere in the app. Open to
  changing this — see [Open questions](#open-questions).

## Email verification

Do **not** add a new `emailVerifiedAt` field — `users._verified` already
exists (Payload's built-in auth field, confirmed in `src/payload-types.ts`
and already used by the current signup + `VerifyEmail` flow). At acceptance,
set `_verified: true` directly via `payload.update()` when creating the
user, rather than going through Payload's own `verifyEmail()` operation.

This is a deliberate divergence from Payload's normal verify flow, confirmed
by reading `payload@3.85.1`'s actual source
(`dist/auth/operations/verifyEmail.js`): Payload's built-in flow looks a
user up by its own `_verificationToken` field and clears it. An invited
user is a fresh document created at the moment of acceptance — the
Invitation's token has already proven email ownership by that point, so
there's nothing left for Payload's separate verification-token dance to do.
No separate verification email is sent, per the spec.

## No placeholder user at invite time

Only the `Invitation` doc is created when the invite is sent. The `users`
doc is created for the first time at **acceptance** (step 8), not before.
`users` has several `required: true` fields (`password`, `organization`,
`role`) that can't be cleanly represented by a half-filled shell record, and
no such "pending user" pattern exists anywhere else in this codebase. This
also means an invite that's never accepted leaves no trace in `users` at
all — just a `PENDING` (eventually stale) `Invitation` row.

## Resending an invitation

Resending creates a **new** `Invitation` document (new token, new
`expiresAt`) and sets the old one's `status` to `REVOKED`, rather than
mutating the existing row's token/expiry in place. This keeps a full audit
trail of every invite attempt per email/inviter, consistent with how the
rest of this app treats records as append-mostly rather than
overwritten-in-place.

## Email template + sending

New template `src/features/email/templates/InviteUserEmail.tsx`, following
the exact shape of the existing `VerifyEmail.tsx`/`ResetPasswordEmail.tsx`
(`Layout`, `BrandLogo`, `EmailHeading`, `EmailText`, `PrimaryButton` linking
to `/invite/<token>`, `EmailFooter`).

Sending follows the existing adapter pattern
(`src/features/email/services/email-pl.adapter.ts`,
c.f. `sendOwnerWelcomeEmailAdapter`): render the template to HTML with
`react-email`'s `render()`, then `payload.sendEmail({ to, subject, html })`
— no new email infrastructure needed, just a new template + a new adapter
function alongside the existing ones.

## Where this lives in the codebase

Following `docs/project/PROJECT_STRUCTURE.md`:

```
src/collections/Invitations.ts         # new collection (sibling to Users.ts, Buildings.ts, ...)

src/features/invitations/              # new feature — spans both the dashboard-triggered
  validations/                         #   "send invite" side and the public "accept invite" side,
    invite-user.ts                     #   same way src/features/auth/ already bundles signup/
    accept-invitation.ts               #   signin/forgot-password/reset-password as one feature
  services/server/
    invitation.service.ts              # create/validate/accept/revoke/resend
  actions/server/
    invite-user.ts                     # owner/manager sends an invite (dashboard mutation)
    accept-invitation.ts               # invitee submits the Join form (public mutation)
  types/
    invitation.types.ts
  pages/
    invite-accept/                     # the public /invite/[token] page content,
      InviteAcceptPage.tsx             #   mirrors src/features/auth/pages/reset-password/

src/app/(frontend)/invite/[token]/page.tsx   # thin route: loads invitation preview, renders the feature page

src/features/email/templates/InviteUserEmail.tsx
src/features/email/services/email-pl.adapter.ts     # + sendInviteEmailAdapter
src/features/email/services/email.ports.ts          # + sendInviteEmail

src/features/user-management/components/AddTeamMemberDialog.tsx  # updated: drop the password
  field, submit calls invite-user action instead of createOrgUserAction
src/features/user-management/validations/create-org-user.ts      # CreateOrgUserSchema loses `password`
```

`AddTeamMemberDialog` and `createOrgUserAction` don't disappear — they
change what they do. The dialog keeps its name/email/role/buildings fields,
drops the password field, and its submit calls the new invite action
instead of creating a user directly.

## Rules checklist (from the original spec)

| Rule | How it's satisfied |
|---|---|
| Store `tokenHash`, not the raw token | `Invitations.tokenHash`, sha256 of a random token |
| Token expires after a limited time | `expiresAt`, checked against `new Date()` |
| Token only works once | `status` flips to `ACCEPTED` atomically with user creation |
| Email comes from the invitation record, not the submitted form | Accept action reads `email` off the looked-up `Invitation` doc, ignores any `email` in the request body |
| Email remains read-only | Not a form field on the accept page at all — displayed as text |
| Resending creates a new token and invalidates the old one | New `Invitation` doc, old one set to `REVOKED` |
| Managers can't invite above their own permission | Already covered by `access.userCreate`'s existing role ceiling, mirrored in `access.invitationCreate` |
| Existing account → ask to sign in instead | `users.email` is already globally unique (Payload's `auth` config); step 2's pre-check surfaces this before an invite is even sent |

## Open questions

Judgment calls made while writing this doc, worth confirming before
building:

- **7-day expiry** — arbitrary, chosen to match the general lifetime used
  elsewhere. Fine to change.
- **Full replacement vs. keep both flows** — this doc assumes "invite" fully
  replaces "set a password directly" for adding teammates, since that's the
  gap `RBAC.md` calls out. If direct-password creation should stay available
  as a fallback (e.g. for environments without email configured), that's a
  bigger change than what's specced here.
- **Invitation collection visibility in Payload admin** — not yet decided
  whether `Invitations` needs its own admin UI list view, or whether it's
  purely an internal collection driven only through the dashboard's
  invite/resend/revoke actions.
