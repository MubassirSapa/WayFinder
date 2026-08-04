import { describe, expect, it } from "vitest";

import { isAdmin, isAdminOrSelf } from "../index";

describe("collection access", () => {
  it("recognizes Payload admin accounts by collection", () => {
    expect(
      isAdmin({ req: { user: { collection: "admins" } } } as never),
    ).toBe(true);
    expect(
      isAdmin({ req: { user: { collection: "users", role: "user" } } } as never),
    ).toBe(false);
    expect(
      isAdmin({ req: { user: { collection: "users", role: "admin" } } } as never),
    ).toBe(false);
  });

  it("allows an admin or the matching user to access a user record", () => {
    expect(
      isAdminOrSelf({ id: 7, req: { user: { collection: "admins", id: 1 } } } as never),
    ).toBe(true);
    expect(
      isAdminOrSelf({ id: 7, req: { user: { collection: "users", id: 7 } } } as never),
    ).toBe(true);
    expect(
      isAdminOrSelf({ id: 7, req: { user: { collection: "users", id: 8 } } } as never),
    ).toBe(false);
  });
});
