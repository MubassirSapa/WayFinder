import type { Access, FieldAccess, Payload, Where } from "payload";

import { relationId, relationIds } from "@/lib/payload-id";
import { isOwnerOrManager, ROLES } from "../constants/roles";

/** The minimal shape `accessibleBuildingIds` needs — satisfied by both `PayloadRequest` and a plain `{ user, payload }` from a Server Component/service. */
type BuildingScopeRequest = {
  user: Parameters<Access>[0]["req"]["user"];
  payload: Payload;
};

/**
 * Public access
 */
export const anyone: Access = () => {
  return true;
};

export const noOne: Access = () => {
  return false;
};

/**
 * Auth access
 */
export const isLoggedIn: Access = ({ req: { user } }) => {
  return Boolean(user);
};

/** The platform team (the separate `admins` auth collection) — unrelated to any organization. */
export const isPlatformAdmin: Access = ({ req: { user } }) => {
  return user?.collection === "admins";
};

/** Field-level equivalent of {@link isPlatformAdmin}, for fields only a platform admin may set directly. */
export const isPlatformAdminField: FieldAccess = ({ req: { user } }) => {
  return user?.collection === "admins";
};

/** Field-level access for fields no request may set directly — only reachable via a hook's `overrideAccess`. */
export const noOneField: FieldAccess = () => {
  return false;
};

/**
 * Self access
 * Best for the Users collection (user.id === document id).
 */
export const isSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;

  return user.id === id;
};

/**
 * Org/building scoping
 *
 * Roles live on the `users` collection: `owner` (one per org, implicitly
 * manages the whole org and every building in it), `manager` (the same
 * organization-wide management access), `member` (read-only,
 * only on the buildings they're assigned to).
 */
export async function accessibleBuildingIds(
  req: BuildingScopeRequest,
): Promise<(number | string)[]> {
  const user = req.user;
  if (!user || user.collection !== "users") return [];

  if (user.role === ROLES.OWNER || user.role === ROLES.MANAGER) {
    const organizationId = relationId(user.organization);
    if (organizationId === null) return [];

    const result = await req.payload.find({
      collection: "buildings",
      where: { organization: { equals: organizationId } },
      sort: "createdAt",
      limit: 0,
      pagination: false,
      depth: 0,
      select: {},
      overrideAccess: true,
    });

    return result.docs.map((building) => building.id);
  }

  return relationIds(user.buildings);
}

/** Read access to the `buildings` collection itself: any role sees the buildings it can access. */
export const buildingRead: Access = async ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user) return false;

  return { id: { in: await accessibleBuildingIds(req) } };
};

/** Create buildings: owners/managers, only inside their own organization. */
export const buildingCreate: Access = async ({ req, data }) => {
  if (req.user?.collection === "admins") return true;
  if (
    !req.user ||
    req.user.collection !== "users" ||
    !isOwnerOrManager(req.user.role)
  ) return false;

  const userOrganizationId = relationId(req.user.organization);
  if (userOrganizationId === null) return false;

  return Boolean(data && "organization" in data && relationId(data.organization) === userOrganizationId);
};

/** Update/delete buildings: constrain the existing record, never trust replacement data. */
export const buildingUpdateDelete: Access = async ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (
    !req.user ||
    req.user.collection !== "users" ||
    !isOwnerOrManager(req.user.role)
  ) return false;

  return { id: { in: await accessibleBuildingIds(req) } };
};

/** Read access to building-owned content (floors, map objects/nodes/edges), scoped by their `building` field. */
export const buildingContentRead: Access = async ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user) return false;

  return { building: { in: await accessibleBuildingIds(req) } };
};

/**
 * Create building-owned content: validate the submitted building. Members
 * are included here (unlike `buildingCreate`/`buildingUpdateDelete`) — a
 * member's whole reason for being assigned to a building is to edit its
 * floors/objects/nodes/edges. `accessibleBuildingIds` already scopes a
 * member to exactly their assigned buildings, so no extra role check is
 * needed beyond that scoping.
 */
export const buildingContentCreate: Access = async ({ req, data }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users") return false;

  const ids = await accessibleBuildingIds(req);

  if (data && "building" in data) {
    const targetBuildingId = relationId(data.building);
    return targetBuildingId !== null && ids.some((id) => String(id) === String(targetBuildingId));
  }

  return false;
};

/** Update/delete building content: constrain the existing record, never trust replacement data. Members included, see `buildingContentCreate`. */
export const buildingContentUpdateDelete: Access = async ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users") return false;

  return { building: { in: await accessibleBuildingIds(req) } };
};

/** Update an organization's own record: owner/manager, only their own org. */
export const organizationUpdate: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (
    !req.user ||
    req.user.collection !== "users" ||
    !isOwnerOrManager(req.user.role)
  ) return false;

  const organizationId = relationId(req.user.organization);
  if (organizationId === null) return false;

  return { id: { equals: organizationId } };
};

/** Read user records: platform admins, any user reading themself, or an owner/manager reading users in their own organization. */
export const userRead: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users") return false;

  if (isOwnerOrManager(req.user.role)) {
    const organizationId = relationId(req.user.organization);
    if (organizationId === null) return false;
    const where: Where = { organization: { equals: organizationId } };
    return where;
  }

  const where: Where = { id: { equals: req.user.id } };
  return where;
};

/** Create a user: owner/manager, only inside their own organization, and never as an owner (exactly one owner per org, set at signup). */
export const userCreate: Access = ({ req, data }) => {
  if (req.user?.collection === "admins") return true;
  if (
    !req.user ||
    req.user.collection !== "users" ||
    !isOwnerOrManager(req.user.role)
  ) return false;

  const organizationId = relationId(req.user.organization);
  if (organizationId === null) return false;
  if (!data || relationId(data.organization) !== organizationId) return false;

  return data.role === ROLES.MANAGER || data.role === ROLES.MEMBER;
};

/** Update a user: platform admins, the user themself, or an owner/manager updating another (non-owner) user in their own organization. */
export const userUpdate: Access = ({ req, id }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users") return false;
  if (id !== undefined && String(req.user.id) === String(id)) return true;

  if (!isOwnerOrManager(req.user.role)) return false;

  const organizationId = relationId(req.user.organization);
  if (organizationId === null) return false;

  const where: Where = { and: [{ organization: { equals: organizationId } }, { role: { not_equals: ROLES.OWNER } }] };
  return where;
};

/** Delete a user: platform admins, or an owner/manager removing another (non-owner) user in their own organization. */
export const userDelete: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (
    !req.user ||
    req.user.collection !== "users" ||
    !isOwnerOrManager(req.user.role)
  ) return false;

  const organizationId = relationId(req.user.organization);
  if (organizationId === null) return false;

  const where: Where = { and: [{ organization: { equals: organizationId } }, { role: { not_equals: ROLES.OWNER } }] };
  return where;
};

/**
 * Field-level access for `Users.role`/`Users.buildings`: platform admins, or
 * an owner/manager setting these on someone *other* than themself. This is
 * what lets `userCreate`/`userUpdate` actually assign role/buildings, while
 * the self-update path (`userUpdate` returning `true` for your own id) still
 * can't touch these fields — preventing self-escalation.
 */
export const canManageOrgUserFields: FieldAccess = ({ req, id }) => {
  if (req.user?.collection === "admins") return true;
  if (
    !req.user ||
    req.user.collection !== "users" ||
    !isOwnerOrManager(req.user.role)
  ) return false;

  return id === undefined || String(req.user.id) !== String(id);
};

/** Read invitations: owner/manager, own organization only — same ceiling as `userRead`'s org-scoped branch. */
export const invitationRead: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users" || !isOwnerOrManager(req.user.role)) return false;

  const organizationId = relationId(req.user.organization);
  if (organizationId === null) return false;

  return { organization: { equals: organizationId } };
};

/** Create an invitation: identical ceiling to `userCreate` — owner/manager, own organization, role never `owner`. */
export const invitationCreate: Access = ({ req, data }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users" || !isOwnerOrManager(req.user.role)) return false;

  const organizationId = relationId(req.user.organization);
  if (organizationId === null) return false;
  if (!data || relationId(data.organization) !== organizationId) return false;

  return data.role === ROLES.MANAGER || data.role === ROLES.MEMBER;
};

/**
 * Grouped access object
 */
export const access = {
  anyone,
  noOne,

  isLoggedIn,
  isPlatformAdmin,
  isPlatformAdminField,
  noOneField,

  isSelf,

  accessibleBuildingIds,
  buildingRead,
  buildingCreate,
  buildingUpdateDelete,
  buildingContentRead,
  buildingContentCreate,
  buildingContentUpdateDelete,

  organizationUpdate,

  userRead,
  userCreate,
  userUpdate,
  userDelete,
  canManageOrgUserFields,

  invitationRead,
  invitationCreate,
};
