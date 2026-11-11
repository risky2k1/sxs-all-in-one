import { describe, expect, it } from "vitest";

import { tabFromPath } from "@/shared/config/paths";

describe("tabFromPath", () => {
  it("reads the studio tab from the path", () => {
    expect(tabFromPath("/c/abc/skills")).toBe("skills");
    expect(tabFromPath("/c/abc/equipment")).toBe("equipment");
  });

  it("falls back to overview", () => {
    expect(tabFromPath("/c/abc")).toBe("overview");
    expect(tabFromPath("/c/abc/overview")).toBe("overview");
  });
});
