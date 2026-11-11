"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/shared/api/studio/session";
import { QUALITIES } from "@/shared/config/options";

function pick<T>(value: T | undefined, fallback: T): T {
  return value === undefined ? fallback : value;
}

const patchSchema = z.object({
  owned: z.boolean().optional(),
  quality: z.enum(QUALITIES).optional(),
  stars: z.number().int().min(1).max(5).optional(),
  equippedSlot: z.number().int().min(0).max(4).optional(),
});

export async function updateFantomon(
  characterId: string,
  fantomonId: string,
  patch: unknown,
) {
  const parsed = patchSchema.parse(patch);
  const { supabase } = await requireUser();
  if (parsed.equippedSlot && parsed.equippedSlot > 0) {
    const cleared = await supabase
      .from("character_fantomons")
      .update({ equipped_slot: 0 })
      .eq("character_id", characterId)
      .eq("equipped_slot", parsed.equippedSlot);
    if (cleared.error) throw new Error(cleared.error.message);
  }
  const existing = await supabase
    .from("character_fantomons")
    .select("*")
    .eq("character_id", characterId)
    .eq("fantomon_id", fantomonId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  const previous = existing.data;
  const row = {
    character_id: characterId,
    fantomon_id: fantomonId,
    owned: pick(parsed.owned, pick(previous?.owned, true)),
    quality: pick(parsed.quality, pick(previous?.quality, "Epic")),
    stars: pick(parsed.stars, pick(previous?.stars, 1)),
    equipped_slot: pick(parsed.equippedSlot, pick(previous?.equipped_slot, 0)),
  };
  const saved = await supabase.from("character_fantomons").upsert(row);
  if (saved.error) throw new Error(saved.error.message);
  revalidatePath(`/c/${characterId}`, "layout");
}
