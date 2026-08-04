import { describe, expect, it, vi } from "vitest";

import {
  buildingContentRead,
  buildingContentWrite,
  buildingManage,
  buildingRead,
  isPlatformAdmin,
  isPlatformAdminOrSelf,
} from "../index";

describe("collection access", () => {
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

    function managerReq(buildingIds: number[]) {
      return {
        user: { collection: "users", role: "manager", buildings: buildingIds },
        payload: { find: vi.fn() },
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

    it("scopes reads to a manager's assigned buildings without querying", async () => {
      const req = managerReq([11, 12]);

      await expect(buildingRead({ req } as never)).resolves.toEqual({ id: { in: [11, 12] } });
      expect(req.payload.find).not.toHaveBeenCalled();
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
        buildingContentWrite({ req, data: { building: 1 } } as never),
      ).resolves.toBe(false);
    });

    it("allows a manager to write only within their assigned buildings", async () => {
      const req = managerReq([10, 20]);

      await expect(
        buildingContentWrite({ req, data: { building: 20 } } as never),
      ).resolves.toBe(true);
      await expect(
        buildingContentWrite({ req, data: { building: 99 } } as never),
      ).resolves.toBe(false);
    });

    it("lets an owner create a building only inside their own organization", async () => {
      const req = { user: { collection: "users", role: "owner", organization: 5 } };

      await expect(buildingManage({ req, data: { organization: 5 } } as never)).resolves.toBe(true);
      await expect(buildingManage({ req, data: { organization: 6 } } as never)).resolves.toBe(false);
    });

    it("scopes an owner's building update/delete to buildings already in their org", async () => {
      const req = ownerReq([{ id: 10 }, { id: 20 }]);

      await expect(buildingManage({ req, data: undefined } as never)).resolves.toEqual({
        id: { in: [10, 20] },
      });
    });
  });
});
