import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { asPayloadId, relationId, relationIds } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import type { Building, User } from "@/payload-types";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import type { OrgUserListItem, TCreateOrgUserInput } from "../../types/user-management.types";

async function getPayloadClient() {
  return getPayload({ config });
}

function toOrgUserListItem(target: User, currentUserId: number | string): OrgUserListItem {
  const buildings = Array.isArray(target.buildings)
    ? (target.buildings.filter((building): building is Building => typeof building === "object"))
    : [];
  const avatar = typeof target.avatar === "object" && target.avatar ? target.avatar : null;

  return {
    id: String(target.id),
    name: target.name,
    email: target.email,
    role: target.role,
    avatarUrl: avatar?.url ?? null,
    buildingIds: relationIds(target.buildings).map(String),
    buildingNames: buildings.map((building) => building.name),
    isSelf: String(target.id) === String(currentUserId),
  };
}

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
