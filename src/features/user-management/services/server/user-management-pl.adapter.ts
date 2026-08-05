import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { asPayloadId, relationId, relationIds } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import type { User } from "@/payload-types";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import type { OrgUserListItem, TCreateOrgUserInput } from "../../types/user-management.types";

async function getPayloadClient() {
  return getPayload({ config });
}

// select/populate below always trims to exactly this shape — Buildings' own
// defaultPopulate now also includes `organization` and `logoUrl` (added for
// other screens), neither of which this table shows, so every call site
// restricts the populated building down to just `name`.
type OrgUserListSource = {
  id: number | string;
  name: string;
  email: string;
  role: User["role"];
  avatarUrl?: string | null;
  buildings?: (number | { id: number | string; name: string })[] | null;
};

function toOrgUserListItem(target: OrgUserListSource, currentUserId: number | string): OrgUserListItem {
  const buildings = Array.isArray(target.buildings)
    ? target.buildings.filter((building) => typeof building === "object")
    : [];

  return {
    id: String(target.id),
    name: target.name,
    email: target.email,
    role: target.role,
    avatarUrl: target.avatarUrl ?? null,
    buildingIds: relationIds(target.buildings).map(String),
    buildingNames: buildings.map((building) => building.name),
    isSelf: String(target.id) === String(currentUserId),
  };
}

const USER_LIST_SELECT = { name: true, email: true, role: true, avatarUrl: true, buildings: true } as const;
const USER_LIST_POPULATE = { buildings: { name: true } } as const;

export async function listOrgUsersAdapter(user: User) {
  return tryCatchResponse<OrgUserListItem[]>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) return [];

    const result = await payload.find({
      collection: "users",
      depth: 1,
      limit: 0,
      pagination: false,
      select: USER_LIST_SELECT,
      populate: USER_LIST_POPULATE,
      sort: "name",
      where: { organization: { equals: organizationId } },
      user,
      overrideAccess: false,
    });

    return result.docs.map((target) => toOrgUserListItem(target, user.id));
  });
}

export async function createOrgUserAdapter(user: User, input: TCreateOrgUserInput) {
  return tryCatchResponse<OrgUserListItem>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(USER_MANAGEMENT_CLIENT.ERROR_CREATE_FAILED);

    const created = await payload.create({
      collection: "users",
      depth: 1,
      select: USER_LIST_SELECT,
      populate: USER_LIST_POPULATE,
      user,
      overrideAccess: false,
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        organization: asPayloadId(organizationId),
        buildings: input.role === "member" ? input.buildingIds.map((id) => asPayloadId(id)) : undefined,
      },
    });

    return toOrgUserListItem(created, user.id);
  });
}

export async function updateOrgUserRoleAdapter(user: User, targetUserId: string, role: "manager" | "member") {
  return tryCatchResponse<OrgUserListItem>(async () => {
    const payload = await getPayloadClient();

    const updated = await payload.update({
      collection: "users",
      id: asPayloadId(targetUserId),
      depth: 1,
      select: USER_LIST_SELECT,
      populate: USER_LIST_POPULATE,
      user,
      overrideAccess: false,
      data: { role, buildings: role === "manager" ? [] : undefined },
    });

    return toOrgUserListItem(updated, user.id);
  });
}

export async function updateOrgUserBuildingsAdapter(user: User, targetUserId: string, buildingIds: string[]) {
  return tryCatchResponse<OrgUserListItem>(async () => {
    const payload = await getPayloadClient();

    const updated = await payload.update({
      collection: "users",
      id: asPayloadId(targetUserId),
      depth: 1,
      select: USER_LIST_SELECT,
      populate: USER_LIST_POPULATE,
      user,
      overrideAccess: false,
      data: { buildings: buildingIds.map((id) => asPayloadId(id)) },
    });

    return toOrgUserListItem(updated, user.id);
  });
}

export async function deleteOrgUserAdapter(user: User, targetUserId: string) {
  return tryCatchResponse<{ id: string }>(async () => {
    const payload = await getPayloadClient();

    await payload.delete({
      collection: "users",
      id: asPayloadId(targetUserId),
      user,
      overrideAccess: false,
    });

    return { id: targetUserId };
  });
}
