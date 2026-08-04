import type { Access, Payload } from "payload";

import { relationId, relationIds } from "@/lib/payload-id";
import { ROLES } from "../constants/roles";

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

/**
 * Self access
 * Best for the Users collection (user.id === document id).
 */
export const isSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;

  return user.id === id;
};

export const isPlatformAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;

  if (user.collection === "admins") return true;

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
      // `id` is always returned regardless of `select` — an empty include
      // object is the correct way to fetch nothing else (verified: returns
      // `{ id }` only, not the unrestricted document).
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
    (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.MANAGER)
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
    (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.MANAGER)
  ) return false;

  return { id: { in: await accessibleBuildingIds(req) } };
};

/** Read access to building-owned content (floors, map objects/nodes/edges), scoped by their `building` field. */
export const buildingContentRead: Access = async ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user) return false;

  return { building: { in: await accessibleBuildingIds(req) } };
};

/** Create building-owned content: validate the submitted building. */
export const buildingContentCreate: Access = async ({ req, data }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users" || req.user.role === ROLES.MEMBER) return false;

  const ids = await accessibleBuildingIds(req);

  if (data && "building" in data) {
    const targetBuildingId = relationId(data.building);
    return targetBuildingId !== null && ids.some((id) => String(id) === String(targetBuildingId));
  }

  return false;
};

/** Update/delete building content: constrain the existing record, never trust replacement data. */
export const buildingContentUpdateDelete: Access = async ({ req }) => {
  if (req.user?.collection === "admins") return true;
  if (!req.user || req.user.collection !== "users" || req.user.role === ROLES.MEMBER) return false;

  return { building: { in: await accessibleBuildingIds(req) } };
};

/**
 * Grouped access object
 */
export const access = {
  anyone,
  noOne,

  isLoggedIn,
  isPlatformAdmin,

  isSelf,
  isPlatformAdminOrSelf,

  accessibleBuildingIds,
  buildingRead,
  buildingCreate,
  buildingUpdateDelete,
  buildingContentRead,
  buildingContentCreate,
  buildingContentUpdateDelete,
};
