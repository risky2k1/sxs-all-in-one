import type {
  CustomSkillRow,
  SkillStateRow,
  Studio,
} from "@/shared/api/studio/studio.types";
import { NUMBER_FIELDS, TEXT_FIELDS } from "@/shared/api/studio/fields";
import { LOADOUT_PRESETS, type PresetKey } from "@/shared/config/presets";

export type SkillPatch = {
  owned?: boolean;
  quality?: string;
  stars?: number;
  equippedSlot?: number;
};

function applySkill<T extends SkillStateRow | CustomSkillRow>(
  row: T,
  patch: SkillPatch,
): T {
  return {
    ...row,
    owned: patch.owned ?? row.owned,
    quality: patch.quality ?? row.quality,
    stars: patch.stars ?? row.stars,
    equipped_slot: patch.equippedSlot ?? row.equipped_slot,
  };
}

function clearSlot(
  studio: Studio,
  type: "active" | "passive",
  slot: number,
  exceptId: string,
): Studio {
  const types = new Map(
    studio.catalog.map((skill) => [skill.id, skill.skill_type]),
  );
  return {
    ...studio,
    skills: studio.skills.map((row) =>
      row.equipped_slot === slot &&
      row.skill_id !== exceptId &&
      types.get(row.skill_id) === type
        ? { ...row, equipped_slot: 0 }
        : row,
    ),
    customSkills: studio.customSkills.map((row) =>
      row.equipped_slot === slot &&
      row.id !== exceptId &&
      row.skill_type === type
        ? { ...row, equipped_slot: 0 }
        : row,
    ),
  };
}

export function patchCatalogSkill(
  studio: Studio,
  skillId: string,
  type: "active" | "passive",
  patch: SkillPatch,
): Studio {
  let next = studio;
  if (patch.equippedSlot && patch.equippedSlot > 0) {
    next = clearSlot(next, type, patch.equippedSlot, skillId);
  }
  const index = next.skills.findIndex((row) => row.skill_id === skillId);
  if (index === -1) {
    return {
      ...next,
      skills: [
        ...next.skills,
        {
          character_id: next.character.id,
          skill_id: skillId,
          owned: patch.owned ?? true,
          quality: patch.quality ?? "Epic",
          stars: patch.stars ?? 1,
          equipped_slot: patch.equippedSlot ?? 0,
        },
      ],
    };
  }
  const skills = next.skills.slice();
  skills[index] = applySkill(skills[index], patch);
  return { ...next, skills };
}

export function patchCustomSkill(
  studio: Studio,
  skillId: string,
  patch: SkillPatch,
): Studio {
  const current = studio.customSkills.find((row) => row.id === skillId);
  if (!current) return studio;
  let next = studio;
  if (patch.equippedSlot && patch.equippedSlot > 0) {
    next = clearSlot(next, current.skill_type, patch.equippedSlot, skillId);
  }
  return {
    ...next,
    customSkills: next.customSkills.map((row) =>
      row.id === skillId ? applySkill(row, patch) : row,
    ),
  };
}

export function patchPreset(studio: Studio, preset: PresetKey): Studio {
  const spec = LOADOUT_PRESETS[preset];
  let next: Studio = {
    ...studio,
    skills: studio.skills.map((row) => ({ ...row, equipped_slot: 0 })),
    customSkills: studio.customSkills.map((row) => ({
      ...row,
      equipped_slot: 0,
    })),
  };
  spec.active.forEach((id, index) => {
    next = patchCatalogSkill(next, id, "active", {
      equippedSlot: index + 1,
      owned: true,
    });
  });
  spec.passive.forEach((id, index) => {
    next = patchCatalogSkill(next, id, "passive", {
      equippedSlot: index + 1,
      owned: true,
    });
  });
  return next;
}

export function patchCharacter(
  studio: Studio,
  patch: Record<string, string | number>,
): Studio {
  const character = { ...studio.character };
  for (const [key, value] of Object.entries(patch)) {
    const column =
      TEXT_FIELDS[key as keyof typeof TEXT_FIELDS] ??
      NUMBER_FIELDS[key as keyof typeof NUMBER_FIELDS];
    if (column) character[column] = value as never;
  }
  return { ...studio, character };
}

export function patchServer(studio: Studio, serverId: string): Studio {
  const server = studio.servers.find((item) => item.id === serverId) ?? null;
  return {
    ...studio,
    character: { ...studio.character, server_id: serverId, servers: server },
  };
}
