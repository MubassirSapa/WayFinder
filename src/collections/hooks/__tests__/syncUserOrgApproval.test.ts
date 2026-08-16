import { describe, expect, it, vi } from "vitest";

import { syncUserOrgApprovalHook } from "../syncUserOrgApproval";

describe("syncUserOrgApprovalHook", () => {
  it("leaves data untouched on operations other than create", async () => {
    const req = { payload: { findByID: vi.fn() } };
    const data = { organization: 5 };

    const result = await syncUserOrgApprovalHook({ data, operation: "update", req } as never);

    expect(result).toBe(data);
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it("leaves data untouched when there's no organization on the incoming data", async () => {
    const req = { payload: { findByID: vi.fn() } };
    const data = { name: "Mubassir" };

    const result = await syncUserOrgApprovalHook({ data, operation: "create", req } as never);

    expect(result).toBe(data);
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it("sets orgApproved to false when the organization isn't approved yet", async () => {
    const req = {
      payload: { findByID: vi.fn().mockResolvedValue({ approved: false }) },
    };

    const result = await syncUserOrgApprovalHook({ data: { organization: 5 }, operation: "create", req } as never);

    expect(req.payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "organizations", id: 5, overrideAccess: true }),
    );
    expect(result).toEqual({ organization: 5, orgApproved: false });
  });

  it("sets orgApproved to true when a teammate is invited into an already-approved organization", async () => {
    const req = {
      payload: { findByID: vi.fn().mockResolvedValue({ approved: true }) },
    };

    const result = await syncUserOrgApprovalHook({
      data: { organization: { id: 5 } },
      operation: "create",
      req,
    } as never);

    expect(result).toEqual({ organization: { id: 5 }, orgApproved: true });
  });
});
