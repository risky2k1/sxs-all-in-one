"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/shared/api/studio/session";
import { QUALITIES } from "@/shared/config/options";

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function refresh(id: string) {
  revalidatePath(`/c/${id}`, "layout");
}

export async function updateEquipment(
  characterId: string,
  slotKey: string,
  patch: unknown,
) {
  const parsed = z
    .object({
      level: z.number().int().min(0).max(400).optional(),
      quality: z.enum(QUALITIES).optional(),
      notes: z.string().max(200).optional(),
    })
    .parse(patch);
  const { supabase } = await requireUser();
  fail(
    (
      await supabase
        .from("character_equipment")
        .update(parsed)
        .eq("character_id", characterId)
        .eq("slot_key", slotKey)
    ).error,
  );
  refresh(characterId);
}

export async function updateSkillSlot(
  characterId: string,
  slotIndex: number,
  level: number,
) {
  const lv = z.number().int().min(1).max(400).parse(level);
  const { supabase } = await requireUser();
  fail(
    (
      await supabase
        .from("character_skill_slots")
        .update({ level: lv })
        .eq("character_id", characterId)
        .eq("slot_index", slotIndex)
    ).error,
  );
  refresh(characterId);
}

export async function setAllSkillSlots(characterId: string, level: number) {
  const lv = z.number().int().min(1).max(400).parse(level);
  const { supabase } = await requireUser();
  fail(
    (
      await supabase
        .from("character_skill_slots")
        .update({ level: lv })
        .eq("character_id", characterId)
    ).error,
  );
  refresh(characterId);
}

export async function addCompanion(characterId: string, companionId: string) {
  const id = z.string().min(1).max(80).parse(companionId);
  const { supabase } = await requireUser();
  fail(
    (
      await supabase.from("character_companions").insert({
        character_id: characterId,
        companion_id: id,
        level: 0,
        priority: "",
      })
    ).error,
  );
  refresh(characterId);
}

export async function updateCompanion(
  characterId: string,
  companionId: string,
  level: number,
) {
  const lv = z.number().int().min(0).max(200).parse(level);
  const { supabase } = await requireUser();
  fail(
    (
      await supabase
        .from("character_companions")
        .update({ level: lv })
        .eq("character_id", characterId)
        .eq("companion_id", companionId)
    ).error,
  );
  refresh(characterId);
}
