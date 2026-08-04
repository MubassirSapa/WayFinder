import { describe, expect, it, vi } from "vitest";

import {
  buildingContentRead,
  buildingContentCreate,
  buildingContentUpdateDelete,
  buildingCreate,
  buildingUpdateDelete,
  buildingRead,
  isPlatformAdmin,
  isPlatformAdminOrSelf,
} from "../index";
import { Users } from "../../Users";

describe("collection access", () => {
  it.each(["role", "organization", "buildings"])(
    "prevents organization users from updating their own %s field",
    (fieldName) => {
      const field = Users.fields.find((candidate) => "name" in candidate && candidate.name === fieldName);
      if (!field || !("access" in field) || !field.access?.update) throw new Error(`Missing ${fieldName} access`);

      expect(field.access.update({ req: { user: { collection: "users" } } } as never)).toBe(false);
      expect(field.access.update({ req: { user: { collection: "admins" } } } as never)).toBe(true);
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

  it("allows a platform admin or the matching user to access a user record", () => {
    expect(
      isPlatformAdminOrSelf({ id: 7, req: { user: { collection: "admins", id: 1 } } } as never),
    ).toBe(true);
    expect(
      isPlatformAdminOrSelf({ id: 7, req: { user: { collection: "users", id: 7 } } } as never),
    ).toBe(true);
    expect(
      isPlatformAdminOrSelf({ id: 7, req: { user: { collection: "users", id: 8 } } } as never),
    ).toBe(false);
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

    it("denies members write access to building content", async () => {
      const req = { user: { collection: "users", role: "member", buildings: [1] } };

      await expect(
        buildingContentCreate({ req, data: { building: 1 } } as never),
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
