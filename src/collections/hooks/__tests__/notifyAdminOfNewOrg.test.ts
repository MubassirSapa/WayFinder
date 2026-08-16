import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifyAdminOfNewOrgHook } from "../notifyAdminOfNewOrg";

const requireEnvMock = vi.hoisted(() => vi.fn().mockReturnValue("admin@umbrellacorp.cc"));

vi.mock("react-email", () => ({ render: vi.fn().mockResolvedValue("<html>mock</html>") }));
vi.mock("@/lib/env", () => ({ requireEnv: requireEnvMock }));

describe("notifyAdminOfNewOrgHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireEnvMock.mockReturnValue("admin@umbrellacorp.cc");
  });

  it("emails the admin address when a new organization is created", async () => {
    const req = { payload: { sendEmail: vi.fn().mockResolvedValue(undefined) } };
    const doc = { id: 1, name: "Acme Hospital", type: "hospital" };

    await notifyAdminOfNewOrgHook({ doc, operation: "create", req } as never);

    expect(requireEnvMock).toHaveBeenCalledWith("ADMIN_EMAIL");
    expect(req.payload.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@umbrellacorp.cc",
        subject: expect.stringContaining("Acme Hospital"),
      }),
    );
  });

  it("does nothing on operations other than create", async () => {
    const req = { payload: { sendEmail: vi.fn() } };

    await notifyAdminOfNewOrgHook({ doc: { id: 1, name: "Acme" }, operation: "update", req } as never);

    expect(req.payload.sendEmail).not.toHaveBeenCalled();
  });

  it("swallows a send failure instead of throwing, so signup never fails because of it", async () => {
    const req = { payload: { sendEmail: vi.fn().mockRejectedValue(new Error("Resend is down")) } };
    const doc = { id: 1, name: "Acme", type: "hospital" };

    await expect(
      notifyAdminOfNewOrgHook({ doc, operation: "create", req } as never),
    ).resolves.toBe(doc);
  });

  it("swallows a missing ADMIN_EMAIL env var instead of throwing", async () => {
    requireEnvMock.mockImplementation(() => {
      throw new Error("Missing required environment variable: ADMIN_EMAIL");
    });
    const req = { payload: { sendEmail: vi.fn() } };
    const doc = { id: 1, name: "Acme", type: "hospital" };

    await expect(
      notifyAdminOfNewOrgHook({ doc, operation: "create", req } as never),
    ).resolves.toBe(doc);
    expect(req.payload.sendEmail).not.toHaveBeenCalled();
  });
});
