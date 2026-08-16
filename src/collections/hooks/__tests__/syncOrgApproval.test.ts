import { beforeEach, describe, expect, it, vi } from "vitest";

import { syncOrgApprovalHook } from "../syncOrgApproval";

vi.mock("react-email", () => ({ render: vi.fn().mockResolvedValue("<html>mock</html>") }));

function makeReq({ owner }: { owner?: { email: string } } = {}) {
  return {
    payload: {
      update: vi.fn().mockResolvedValue(undefined),
      find: vi.fn().mockResolvedValue({ docs: owner ? [owner] : [] }),
      sendEmail: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe("syncOrgApprovalHook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does nothing when the operation isn't an update", async () => {
    const req = makeReq();
    const doc = { id: 5, name: "Acme", approved: true };

    await syncOrgApprovalHook({ doc, previousDoc: { approved: false }, operation: "create", req } as never);

    expect(req.payload.update).not.toHaveBeenCalled();
  });

  it("does nothing when approved is false", async () => {
    const req = makeReq();
    const doc = { id: 5, name: "Acme", approved: false };

    await syncOrgApprovalHook({ doc, previousDoc: { approved: false }, operation: "update", req } as never);

    expect(req.payload.update).not.toHaveBeenCalled();
  });

  it("does nothing when approved was already true (no false-to-true transition)", async () => {
    const req = makeReq();
    const doc = { id: 5, name: "Acme", approved: true };

    await syncOrgApprovalHook({ doc, previousDoc: { approved: true }, operation: "update", req } as never);

    expect(req.payload.update).not.toHaveBeenCalled();
  });

  it("bulk-syncs orgApproved onto every user in the org and emails the owner on the false-to-true transition", async () => {
    const req = makeReq({ owner: { email: "owner@acme.com" } });
    const doc = { id: 5, name: "Acme", approved: true };

    await syncOrgApprovalHook({ doc, previousDoc: { approved: false }, operation: "update", req } as never);

    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "users",
        where: { organization: { equals: 5 } },
        data: { orgApproved: true },
        overrideAccess: true,
      }),
    );
    expect(req.payload.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@acme.com", subject: expect.stringContaining("Acme") }),
    );
  });

  it("skips the email but still syncs users when no owner is found", async () => {
    const req = makeReq();
    const doc = { id: 5, name: "Acme", approved: true };

    await syncOrgApprovalHook({ doc, previousDoc: { approved: false }, operation: "update", req } as never);

    expect(req.payload.update).toHaveBeenCalled();
    expect(req.payload.sendEmail).not.toHaveBeenCalled();
  });
});
