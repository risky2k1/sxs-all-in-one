import { describe, expect, it } from "vitest";

import type { Studio } from "@/shared/api/studio/studio.types";
import { patchCatalogSkill, patchCharacter } from "@/shared/studio/patch";

function studio(): Studio {
  return {
    character: {
      id: "c1",
      server_id: "s1",
      servers: { id: "s1", name: "A", opened_on: "2026-01-01" },
      morning_star: "1",
    },
    skills: [
      {
        character_id: "c1",
        skill_id: "slash",
        owned: false,
        quality: "Epic",
        stars: 1,
        equipped_slot: 1,
      },
      {
        character_id: "c1",
        skill_id: "guard",
        owned: true,
        quality: "Epic",
        stars: 1,
        equipped_slot: 1,
      },
    ],
    customSkills: [],
    catalog: [
      { id: "slash", skill_type: "active" },
      { id: "guard", skill_type: "passive" },
    ],
    equipment: [],
    skillSlots: [],
    companions: [],
    fantomons: [],
    assets: [],
    characters: [],
    servers: [],
    isOwner: false,
    supabaseUrl: "",
  } as unknown as Studio;
}

describe("patchCatalogSkill", () => {
  it("marks a skill owned before the server answers", () => {
    const next = patchCatalogSkill(studio(), "slash", "active", {
      owned: true,
    });
    expect(next.skills.find((row) => row.skill_id === "slash")?.owned).toBe(
      true,
    );
  });

  it("clears another skill already sitting in the slot", () => {
    const next = patchCatalogSkill(studio(), "bash", "active", {
      equippedSlot: 1,
      owned: true,
    });
    expect(
      next.skills.find((row) => row.skill_id === "slash")?.equipped_slot,
    ).toBe(0);
    expect(
      next.skills.find((row) => row.skill_id === "guard")?.equipped_slot,
    ).toBe(1);
    expect(
      next.skills.find((row) => row.skill_id === "bash")?.equipped_slot,
    ).toBe(1);
  });
});

describe("patchCharacter", () => {
  it("updates the header field immediately", () => {
    const next = patchCharacter(studio(), { morningStar: "9" });
    expect(next.character.morning_star).toBe("9");
  });
});
