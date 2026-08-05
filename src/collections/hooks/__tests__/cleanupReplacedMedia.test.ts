import { describe, expect, it, vi } from "vitest";

import { createCleanupReplacedMediaHook } from "../cleanupReplacedMedia";

describe("createCleanupReplacedMediaHook", () => {
  const hook = createCleanupReplacedMediaHook({ relationField: "logo" });

  it("does nothing on create, where previousDoc is an empty object", async () => {
    const req = { payload: { delete: vi.fn() } };

    await hook({ doc: { logo: 7 }, previousDoc: {}, req } as never);

    expect(req.payload.delete).not.toHaveBeenCalled();
  });

  it("does nothing when the relation is unchanged", async () => {
    const req = { payload: { delete: vi.fn() } };

    await hook({ doc: { logo: 7 }, previousDoc: { logo: 7 }, req } as never);

    expect(req.payload.delete).not.toHaveBeenCalled();
  });

  it("deletes the old media doc when the relation changes to a different id", async () => {
    const req = { payload: { delete: vi.fn().mockResolvedValue({}) } };

    await hook({ doc: { logo: 9 }, previousDoc: { logo: 7 }, req } as never);

    expect(req.payload.delete).toHaveBeenCalledWith({ collection: "media", id: 7, overrideAccess: true });
  });

  it("deletes the old media doc when the relation is cleared to null", async () => {
    const req = { payload: { delete: vi.fn().mockResolvedValue({}) } };

    await hook({ doc: { logo: null }, previousDoc: { logo: 7 }, req } as never);

    expect(req.payload.delete).toHaveBeenCalledWith({ collection: "media", id: 7, overrideAccess: true });
  });

  it("swallows an error deleting an already-gone media doc", async () => {
    const req = { payload: { delete: vi.fn().mockRejectedValue(new Error("not found")) } };

    await expect(hook({ doc: { logo: null }, previousDoc: { logo: 7 }, req } as never)).resolves.toBeUndefined();
  });
});
