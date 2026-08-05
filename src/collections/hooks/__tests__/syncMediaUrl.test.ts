import { describe, expect, it, vi } from "vitest";

import { createSyncMediaUrlHook } from "../syncMediaUrl";

describe("createSyncMediaUrlHook", () => {
  const hook = createSyncMediaUrlHook({ relationField: "logo", urlField: "logoUrl" });

  it("leaves data untouched when the relation field isn't part of this update", async () => {
    const req = { payload: { findByID: vi.fn() } };
    const data = { name: "Acme" };

    const result = await hook({ data, req } as never);

    expect(result).toBe(data);
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it("clears the url field when the relation is explicitly set to null", async () => {
    const req = { payload: { findByID: vi.fn() } };

    const result = await hook({ data: { logo: null }, req } as never);

    expect(result).toEqual({ logo: null, logoUrl: null });
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it("uses the url directly when the relation is already a populated object", async () => {
    const req = { payload: { findByID: vi.fn() } };

    const result = await hook({
      data: { logo: { id: 7, url: "https://cdn.example.com/logo.png" } },
      req,
    } as never);

    expect(result).toEqual({
      logo: { id: 7, url: "https://cdn.example.com/logo.png" },
      logoUrl: "https://cdn.example.com/logo.png",
    });
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it("looks up the media doc when the relation is a raw id", async () => {
    const req = {
      payload: {
        findByID: vi.fn().mockResolvedValue({ id: 7, url: "https://cdn.example.com/logo.png" }),
      },
    };

    const result = await hook({ data: { logo: 7 }, req } as never);

    expect(req.payload.findByID).toHaveBeenCalledWith({
      collection: "media",
      id: 7,
      depth: 0,
      overrideAccess: true,
    });
    expect(result).toEqual({ logo: 7, logoUrl: "https://cdn.example.com/logo.png" });
  });

  it("stores null when the looked-up media doc has no url", async () => {
    const req = {
      payload: {
        findByID: vi.fn().mockResolvedValue({ id: 7, url: undefined }),
      },
    };

    const result = await hook({ data: { logo: 7 }, req } as never);

    expect(result).toEqual({ logo: 7, logoUrl: null });
  });
});
