import { describe, expect, it } from "vitest";

import { blockLoginHook } from "../blockLogin";

describe("blockLoginHook", () => {
  it("throws to abort login when the user is blocked", () => {
    const user = { id: 1, blocked: true };

    expect(() => blockLoginHook({ user } as never)).toThrow("This account has been blocked.");
  });

  it("passes the user through unchanged when not blocked", () => {
    const user = { id: 1, blocked: false };

    expect(blockLoginHook({ user } as never)).toBe(user);
  });
});
