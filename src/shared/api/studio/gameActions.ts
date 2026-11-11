"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/shared/api/studio/session";
import { QUALITIES } from "@/shared/config/options";
import { LOADOUT_PRESETS, type PresetKey } from "@/shared/config/presets";

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function refresh(id: string) {
  revalidatePath(`/c/${id}`, "layout");
}

const skillPatch = z.object({
  owned: z.boolean().optional(),
  quality: z.enum(QUALITIES).optional(),
  stars: z.number().int().min(0).max(10).optional(),
  equippedSlot: z.number().int().min(0).max(4).optional(),
});

async function clearSlot(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  characterId: string,
  skillType: "active" | "passive",
  slot: number,
) {
  const same = await supabase
    .from("catalog_skills")
    .select("id")
    .eq("skill_type", skillType);
  const ids = (same.data ?? []).map((row) => row.id as string);
  if (ids.length > 0) {
    fail(
      (
        await supabase
          .from("character_skills")
          .update({ equipped_slot: 0 })
          .eq("character_id", characterId)
          .eq("equipped_slot", slot)
          .in("skill_id", ids)
      ).error,
    );
  }
  fail(
    (
      await supabase
        .from("character_custom_skills")
        .update({ equipped_slot: 0 })
        .eq("character_id", characterId)
        .eq("skill_type", skillType)
        .eq("equipped_slot", slot)
    ).error,
  );
}

export async function updateSkill(
  characterId: string,
  skillId: string,
  skillType: "active" | "passive",
  patch: unknown,
) {
  const parsed = skillPatch.parse(patch);
  const { supabase } = await requireUser();
  if (parsed.equippedSlot && parsed.equippedSlot > 0) {
    await clearSlot(supabase, characterId, skillType, parsed.equippedSlot);
  }
  const existing = await supabase
    .from("character_skills")
    .select("*")
    .eq("character_id", characterId)
    .eq("skill_id", skillId)
    .maybeSingle();
  fail(existing.error);
  const row = {
    character_id: characterId,
    skill_id: skillId,
    owned: parsed.owned ?? existing.data?.owned ?? true,
    quality: parsed.quality ?? existing.data?.quality ?? "Epic",
    stars: parsed.stars ?? existing.data?.stars ?? 1,
    equipped_slot: parsed.equippedSlot ?? existing.data?.equipped_slot ?? 0,
  };
  fail((await supabase.from("character_skills").upsert(row)).error);
  refresh(characterId);
}

export async function updateCustomSkill(
  characterId: string,
  id: string,
  patch: unknown,
) {
  const parsed = skillPatch.parse(patch);
  const { supabase } = await requireUser();
  const current = await supabase
    .from("character_custom_skills")
    .select("skill_type")
    .eq("id", id)
    .eq("character_id", characterId)
    .maybeSingle();
  fail(current.error);
  if (!current.data) throw new Error("Không thấy kỹ năng");
  if (parsed.equippedSlot && parsed.equippedSlot > 0) {
    await clearSlot(
      supabase,
      characterId,
      current.data.skill_type,
      parsed.equippedSlot,
    );
  }
  const row: Record<string, string | number | boolean> = {};
  if (parsed.owned !== undefined) row.owned = parsed.owned;
  if (parsed.quality) row.quality = parsed.quality;
  if (parsed.stars !== undefined) row.stars = parsed.stars;
  if (parsed.equippedSlot !== undefined)
    row.equipped_slot = parsed.equippedSlot;
  fail(
    (
      await supabase
        .from("character_custom_skills")
        .update(row)
        .eq("id", id)
        .eq("character_id", characterId)
    ).error,
  );
  refresh(characterId);
}

export async function addCustomSkill(characterId: string, input: unknown) {
  const parsed = z
    .object({
      vn: z.string().min(1).max(80),
      en: z.string().max(80).optional(),
      tierClass: z.string().min(1).max(8),
      skillType: z.enum(["active", "passive"]),
    })
    .parse(input);
  const { supabase } = await requireUser();
  fail(
    (
      await supabase.from("character_custom_skills").insert({
        character_id: characterId,
        vn: parsed.vn,
        en: parsed.en || "Custom Skill",
        tier_class: parsed.tierClass,
        skill_type: parsed.skillType,
        cd: parsed.skillType === "active" ? "1 Turn" : "Charm",
        description: "Kỹ năng người chơi tự bổ sung.",
      })
    ).error,
  );
  refresh(characterId);
}

export async function applyPreset(characterId: string, preset: PresetKey) {
  const spec = LOADOUT_PRESETS[preset];
  const { supabase } = await requireUser();
  fail(
    (
      await supabase
        .from("character_skills")
        .update({ equipped_slot: 0 })
        .eq("character_id", characterId)
    ).error,
  );
  fail(
    (
      await supabase
        .from("character_custom_skills")
        .update({ equipped_slot: 0 })
        .eq("character_id", characterId)
    ).error,
  );
  const entries = [
    ...spec.active.map((id, index) => ({ id, slot: index + 1 })),
    ...spec.passive.map((id, index) => ({ id, slot: index + 1 })),
  ];
  for (const entry of entries) {
    const updated = await supabase
      .from("character_skills")
      .update({ owned: true, equipped_slot: entry.slot })
      .eq("character_id", characterId)
      .eq("skill_id", entry.id)
      .select("skill_id");
    fail(updated.error);
    if (!updated.data?.length) {
      fail(
        (
          await supabase.from("character_skills").insert({
            character_id: characterId,
            skill_id: entry.id,
            owned: true,
            quality: "Epic",
            stars: 1,
            equipped_slot: entry.slot,
          })
        ).error,
      );
    }
  }
  refresh(characterId);
}
