import { describe, expect, it } from "vitest";

import { serverDay } from "@/shared/lib/serverDay";

describe("serverDay", () => {
  it("counts the open date as day 1 in Ho Chi Minh time", () => {
    const now = new Date("2026-11-11T03:00:00Z");
    expect(serverDay("2026-11-11", now)).toBe(1);
    expect(serverDay("2026-11-08", now)).toBe(4);
  });
});
