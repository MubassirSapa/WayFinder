# Role-Based Access Control

Wayfinder separates platform administration from organization access. Payload
access functions are the authorization boundary; UI visibility alone never
grants or denies permission.

## Roles

| Capability | Platform admin | Owner | Manager | Member |
| --- | --- | --- | --- | --- |
| Manage platform records | Yes | No | No | No |
| Read every building in own organization | N/A | Yes | Yes | No |
| Create, update, and delete own-organization buildings | N/A | Yes | Yes | No |
| Manage map content in own organization | N/A | Yes | Yes | No |
| Read explicitly assigned buildings | N/A | Yes | Yes | Yes |
| Change own role, organization, or assignments | No | No | No | No |

`admins` are platform-team accounts and are not organization users. The
`owner`, `manager`, and `member` values belong only to authenticated `users`.

## Scope rules

- Owners and managers implicitly access every building whose `organization`
  matches their user record.
- Members can read only buildings listed in their `buildings` relationship.
- Members cannot create, update, or delete buildings or map content.
- Organization users cannot move buildings or map content between scopes.
  Relationship scope fields are immutable through organization-user requests.
- A user cannot update their own `role`, `organization`, or `buildings` fields.
  Those changes require a platform-admin request or a future trusted membership
  workflow that performs its own authorization.

## Enforcement

The reusable access functions live in `src/collections/access/index.ts`.
Creation checks proposed relationship values, while update and delete checks
return query constraints against the existing document. This distinction
prevents a caller from gaining access to an out-of-scope record by submitting
an in-scope replacement value.

Collection rules are applied to `buildings`, `floors`, `map-objects`,
`map-nodes`, and `path-edges`. The `users` collection additionally uses
field-level update restrictions for authorization-bearing fields.

## Adding trusted role management

A future organization membership workflow must use a dedicated server-side
operation. Before changing a user, it must verify that the actor is authorized
for the target organization, prevent cross-organization assignments, and
validate every assigned building belongs to that organization. Do not relax
self-update access on the `users` collection to implement this workflow.
