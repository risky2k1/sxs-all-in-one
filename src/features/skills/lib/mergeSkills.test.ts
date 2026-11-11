import { describe, expect, it } from "vitest";

import { skillInSlot, type SkillCardModel } from "./mergeSkills";

function skill(
  id: string,
  type: SkillCardModel["type"],
  equippedSlot: number,
): SkillCardModel {
  return {
    id,
    custom: false,
    type,
    tierClass: "R1",
    vn: id,
    en: id,
    cn: id,
    element: "Physical",
    tier: "A",
    owned: true,
    quality: "Epic",
    stars: 1,
    equippedSlot,
    iconKey: id,
  };
}

describe("skillInSlot", () => {
  const skills = [
    skill("whirlwind", "active", 1),
    skill("guard", "passive", 1),
  ];

  it("returns the skill in that slot", () => {
    expect(skillInSlot(skills, "active", 1, [])?.id).toBe("whirlwind");
  });

  it("treats a pending unequip as an empty slot", () => {
    expect(skillInSlot(skills, "active", 1, ["whirlwind"])).toBeUndefined();
    expect(skillInSlot(skills, "passive", 1, ["whirlwind"])?.id).toBe("guard");
  });
});
