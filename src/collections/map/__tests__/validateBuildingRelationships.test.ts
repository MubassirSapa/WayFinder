import { describe, expect, it, vi } from "vitest";

import {
  validateMapObjectBuilding,
  validatePathEdgeBuilding,
} from "../validateBuildingRelationships";

describe("map building relationship validation", () => {
  it("rejects an object whose floor belongs to another building", async () => {
    const req = {
      payload: {
        findByID: vi.fn().mockResolvedValue({ id: 4, building: 99 }),
      },
    };

    await expect(
      validateMapObjectBuilding({ data: { building: 10, floor: 4 }, req } as never),
    ).rejects.toThrow("floor must belong to the selected building");
  });

  it("allows cross-floor edges when every relation stays inside one building", async () => {
    const req = {
      payload: {
        findByID: vi.fn().mockResolvedValue({ building: 10 }),
      },
    };
    const data = { building: 10, floor: 1, fromNode: 2, toNode: 3 };

    await expect(validatePathEdgeBuilding({ data, req } as never)).resolves.toBe(data);
    expect(req.payload.findByID).toHaveBeenCalledTimes(3);
  });

  it("rejects an edge endpoint from another building", async () => {
    const req = {
      payload: {
        findByID: vi.fn().mockImplementation(({ id }: { id: number }) =>
          Promise.resolve({ building: id === 3 ? 99 : 10 }),
        ),
      },
    };

    await expect(
      validatePathEdgeBuilding({
        data: { building: 10, floor: 1, fromNode: 2, toNode: 3 },
        req,
      } as never),
    ).rejects.toThrow("toNode must belong to the selected building");
  });
});
