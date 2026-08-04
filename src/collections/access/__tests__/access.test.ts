import { describe, expect, it, vi } from "vitest";

import {
  buildingContentRead,
  buildingContentCreate,
  buildingContentUpdateDelete,
  buildingCreate,
  buildingUpdateDelete,
  buildingRead,
  canManageOrgUserFields,
  isPlatformAdmin,
  organizationUpdate,
  userCreate,
  userDelete,
  userRead,
  userUpdate,
} from "../index";
import { Users } from "../../Users";

describe("collection access", () => {
  it("keeps the organization field locked to platform admins only", () => {
    const field = Users.fields.find((candidate) => "name" in candidate && candidate.name === "organization");
    if (!field || !("access" in field) || !field.access?.update) throw new Error("Missing organization access");

    expect(field.access.update({ req: { user: { collection: "users", role: "owner" } } } as never)).toBe(false);
    expect(field.access.update({ req: { user: { collection: "admins" } } } as never)).toBe(true);
  });

  it.each(["role", "buildings"])(
    "lets an owner/manager manage another user's %s field but not their own",
    (fieldName) => {
      const field = Users.fields.find((candidate) => "name" in candidate && candidate.name === fieldName);
      if (!field || !("access" in field) || !field.access?.update) throw new Error(`Missing ${fieldName} access`);

      expect(field.access.update({ req: { user: { collection: "admins" } } } as never)).toBe(true);
      expect(
        field.access.update({ id: 8, req: { user: { collection: "users", role: "owner", id: 7 } } } as never),
      ).toBe(true);
      expect(
        field.access.update({ id: 7, req: { user: { collection: "users", role: "owner", id: 7 } } } as never),
      ).toBe(false);
      expect(
        field.access.update({ id: 8, req: { user: { collection: "users", role: "member", id: 7 } } } as never),
      ).toBe(false);
    },
  );

  it("recognizes Payload admin accounts by collection", () => {
    expect(
      isPlatformAdmin({ req: { user: { collection: "admins" } } } as never),
    ).toBe(true);
    expect(
      isPlatformAdmin({ req: { user: { collection: "users", role: "member" } } } as never),
    ).toBe(false);
    expect(
      isPlatformAdmin({ req: { user: { collection: "users", role: "owner" } } } as never),
    ).toBe(false);
  });

  describe("canManageOrgUserFields", () => {
    it("denies anonymous and member requests", () => {
      expect(canManageOrgUserFields({ req: { user: null } } as never)).toBe(false);
      expect(
        canManageOrgUserFields({ req: { user: { collection: "users", role: "member", id: 1 } } } as never),
      ).toBe(false);
    });
  });

  describe("organization access", () => {
    it("lets an owner/manager update only their own organization", () => {
      const ownerReq = { user: { collection: "users", role: "owner", organization: 5 } };
      const managerReq = { user: { collection: "users", role: "manager", organization: 5 } };

      expect(organizationUpdate({ req: ownerReq } as never)).toEqual({ id: { equals: 5 } });
      expect(organizationUpdate({ req: managerReq } as never)).toEqual({ id: { equals: 5 } });
    });

    it("denies members and anonymous requests", () => {
      expect(
        organizationUpdate({ req: { user: { collection: "users", role: "member", organization: 5 } } } as never),
      ).toBe(false);
      expect(organizationUpdate({ req: { user: null } } as never)).toBe(false);
    });
  });

  describe("user access", () => {
    it("scopes reads: self only for a member, whole org for owner/manager", () => {
      expect(
        userRead({ req: { user: { collection: "users", role: "member", id: 7 } } } as never),
      ).toEqual({ id: { equals: 7 } });
      expect(
        userRead({ req: { user: { collection: "users", role: "owner", organization: 5 } } } as never),
      ).toEqual({ organization: { equals: 5 } });
      expect(userRead({ req: { user: { collection: "admins" } } } as never)).toBe(true);
    });

    it("lets an owner/manager create a manager or member in their own org, never an owner", () => {
      const req = { user: { collection: "users", role: "owner", organization: 5 } };

      expect(userCreate({ req, data: { organization: 5, role: "member" } } as never)).toBe(true);
      expect(userCreate({ req, data: { organization: 5, role: "manager" } } as never)).toBe(true);
      expect(userCreate({ req, data: { organization: 5, role: "owner" } } as never)).toBe(false);
      expect(userCreate({ req, data: { organization: 6, role: "member" } } as never)).toBe(false);
    });

    it("denies a member from creating any user", () => {
      const req = { user: { collection: "users", role: "member", organization: 5 } };
      expect(userCreate({ req, data: { organization: 5, role: "member" } } as never)).toBe(false);
    });

    it("always lets a user update themself at the document level", () => {
      expect(
        userUpdate({ id: 7, req: { user: { collection: "users", role: "member", id: 7 } } } as never),
      ).toBe(true);
    });

    it("lets an owner/manager update other non-owner users in their org, never the owner's row", () => {
      const req = { user: { collection: "users", role: "manager", id: 1, organization: 5 } };

      expect(userUpdate({ id: 8, req } as never)).toEqual({
        and: [{ organization: { equals: 5 } }, { role: { not_equals: "owner" } }],
      });
    });

    it("denies a member from updating another user", () => {
      const req = { user: { collection: "users", role: "member", id: 1, organization: 5 } };
      expect(userUpdate({ id: 8, req } as never)).toBe(false);
    });

    it("lets an owner/manager delete other non-owner users in their org", () => {
      const req = { user: { collection: "users", role: "owner", organization: 5 } };

      expect(userDelete({ req } as never)).toEqual({
        and: [{ organization: { equals: 5 } }, { role: { not_equals: "owner" } }],
      });
    });

    it("denies a member from deleting any user", () => {
      const req = { user: { collection: "users", role: "member", organization: 5 } };
      expect(userDelete({ req } as never)).toBe(false);
    });
  });

  describe("building scoping", () => {
    function ownerReq(buildings: Array<{ id: number }>) {
      return {
        user: { collection: "users", role: "owner", organization: 5 },
        payload: { find: vi.fn().mockResolvedValue({ docs: buildings }) },
      };
    }

    function managerReq(buildings: Array<{ id: number }>) {
      return {
        user: { collection: "users", role: "manager", organization: 5, buildings: [999] },
        payload: { find: vi.fn().mockResolvedValue({ docs: buildings }) },
      };
    }

    it("scopes reads to every building in an owner's organization, queried by org id", async () => {
      const req = ownerReq([{ id: 10 }, { id: 20 }]);

      await expect(buildingRead({ req } as never)).resolves.toEqual({ id: { in: [10, 20] } });
      expect(req.payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "buildings",
          where: { organization: { equals: 5 } },
        }),
      );
    });

    it("scopes managers to every building in their organization, ignoring assignments", async () => {
      const req = managerReq([{ id: 11 }, { id: 12 }]);

      await expect(buildingRead({ req } as never)).resolves.toEqual({ id: { in: [11, 12] } });
      expect(req.payload.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organization: { equals: 5 } } }),
      );
    });

    it("lets platform admins bypass building scoping entirely", async () => {
      await expect(
        buildingContentRead({ req: { user: { collection: "admins" } } } as never),
      ).resolves.toBe(true);
    });

    it("denies anonymous requests", async () => {
      await expect(buildingContentRead({ req: { user: null } } as never)).resolves.toBe(false);
    });

    it("lets a member create content only in a building they're assigned to", async () => {
      const req = { user: { collection: "users", role: "member", buildings: [1] } };

      await expect(
        buildingContentCreate({ req, data: { building: 1 } } as never),
      ).resolves.toBe(true);
      await expect(
        buildingContentCreate({ req, data: { building: 2 } } as never),
      ).resolves.toBe(false);
    });

    it("allows a manager to create content in any building in their organization", async () => {
      const req = managerReq([{ id: 10 }, { id: 20 }]);

      await expect(
        buildingContentCreate({ req, data: { building: 20 } } as never),
      ).resolves.toBe(true);
      await expect(
        buildingContentCreate({ req, data: { building: 99 } } as never),
      ).resolves.toBe(false);
    });

    it("lets an owner create a building only inside their own organization", async () => {
      const req = { user: { collection: "users", role: "owner", organization: 5 } };

      await expect(buildingCreate({ req, data: { organization: 5 } } as never)).resolves.toBe(true);
      await expect(buildingCreate({ req, data: { organization: 6 } } as never)).resolves.toBe(false);
    });

    it("lets a manager create a building only inside their own organization", async () => {
      const req = managerReq([]);

      await expect(buildingCreate({ req, data: { organization: 5 } } as never)).resolves.toBe(true);
      await expect(buildingCreate({ req, data: { organization: 6 } } as never)).resolves.toBe(false);
    });

    it("scopes an owner's building update/delete to buildings already in their org", async () => {
      const req = ownerReq([{ id: 10 }, { id: 20 }]);

      await expect(buildingUpdateDelete({ req, data: { organization: 999 } } as never)).resolves.toEqual({
        id: { in: [10, 20] },
      });
    });

    it("constrains content updates by the existing record even when replacement data is supplied", async () => {
      const req = managerReq([{ id: 10 }, { id: 20 }]);

      await expect(
        buildingContentUpdateDelete({ req, data: { building: 99 } } as never),
      ).resolves.toEqual({ building: { in: [10, 20] } });
    });
  });
});
