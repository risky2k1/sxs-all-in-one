import { describe, expect, it } from "vitest";

import { buildPrompt } from "./buildPrompt";
import type { LegacySkill } from "@/shared/lib/legacy.types";
import { mergeLegacy } from "@/shared/lib/legacyState";

const flame: LegacySkill = {
  id: "r2_flame_aura",
  tierClass: "R2",
  type: "active",
  vn: "Hỏa Diễm Tùy Thân",
  en: "Flame Aura",
  cn: "火焰随身",
  cd: "1 Turn",
  element: "Fire",
  tier: "S+",
  desc: "Aura",
};

describe("buildPrompt", () => {
  it("includes the character and the equipped skill", () => {
    const prompt = buildPrompt(mergeLegacy({}), [flame]);
    expect(prompt).toContain("Aquariuss");
    expect(prompt).toContain("Flame Aura");
    expect(prompt).toContain("Resonance +35");
  });
});
