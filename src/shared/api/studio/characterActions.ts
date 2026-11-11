"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { NUMBER_FIELDS, TEXT_FIELDS } from "@/shared/api/studio/fields";
import { requireUser } from "@/shared/api/studio/session";
import { loadStudio } from "@/shared/api/studio/loadStudio";
import { legacyToPayload, mergeLegacy } from "@/shared/lib/legacyState";
import { studioToLegacy } from "@/shared/lib/studioLegacy";
import { blankPayload, starterPayload } from "@/shared/lib/templates";
import { shiftCalendarDay } from "@/shared/lib/serverDay";

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function refresh(id?: string) {
  if (id) revalidatePath(`/c/${id}`, "layout");
  revalidatePath("/characters");
  revalidatePath("/");
}

const text = z.string().max(500);
const patchSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    combatPower: text.optional(),
    currentClass: text.optional(),
    rankTier: text.optional(),
    currentMap: text.optional(),
    mirageTower: text.optional(),
    dailyDungeonStatus: text.optional(),
    spendingTier: text.optional(),
    gold: text.optional(),
    morningStar: text.optional(),
    coloredDiamond: text.optional(),
    stamina: text.optional(),
    battleEssence: text.optional(),
    prayerProgress: text.optional(),
    dailyBuyPattern: text.optional(),
    selectedPet: text.optional(),
    petStatus: text.optional(),
    relicProgress: text.optional(),
    goddessStatues: text.optional(),
    shopRoutine: text.optional(),
    customQuestion: z.string().max(4000).optional(),
    level: z.number().int().min(1).max(400).optional(),
    totalJobLevel: z.number().int().min(0).max(400).optional(),
    warriorJobLevel: z.number().int().min(0).max(400).optional(),
    mageJobLevel: z.number().int().min(0).max(400).optional(),
    duelistJobLevel: z.number().int().min(0).max(400).optional(),
    normalPrayerTickets: z.number().int().min(0).optional(),
    classPrayerTickets: z.number().int().min(0).optional(),
    skillSelectTickets: z.number().int().min(0).optional(),
    secretRealmTotal: z.number().int().min(0).optional(),
    hammerStone: z.number().int().min(0).optional(),
    pickaxeGold: z.number().int().min(0).optional(),
    gloveEssence: z.number().int().min(0).optional(),
    shovelSand: z.number().int().min(0).optional(),
    fateFruits: z.number().int().min(0).optional(),
    timeCrystals: z.number().int().min(0).optional(),
    cartStoneLv: z.number().int().min(0).max(400).optional(),
    cartOreLv: z.number().int().min(0).max(400).optional(),
    cartWoodLv: z.number().int().min(0).max(400).optional(),
    cartSandLv: z.number().int().min(0).max(400).optional(),
    cartOtherLv: z.number().int().min(0).max(400).optional(),
    bedLv: z.number().int().min(0).max(400).optional(),
  })
  .strict();

export async function updateCharacter(id: string, patch: unknown) {
  const parsed = patchSchema.parse(patch);
  const row: Record<string, string | number> = {};
  for (const [key, column] of Object.entries(TEXT_FIELDS)) {
    const value = parsed[key as keyof typeof parsed];
    if (typeof value === "string") row[column] = value;
  }
  for (const [key, column] of Object.entries(NUMBER_FIELDS)) {
    const value = parsed[key as keyof typeof parsed];
    if (typeof value === "number") row[column] = value;
  }
  const { supabase } = await requireUser();
  const { error } = await supabase.from("characters").update(row).eq("id", id);
  fail(error);
  refresh(id);
}

async function firstServerId(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
) {
  const listed = await supabase
    .from("servers")
    .select("id")
    .order("opened_on", { ascending: true })
    .limit(1);
  fail(listed.error);
  if (listed.data?.[0]) return listed.data[0].id as string;
  const created = await supabase
    .from("servers")
    .insert({
      user_id: userId,
      name: "Default",
      opened_on: shiftCalendarDay(-3),
    })
    .select("id")
    .single();
  fail(created.error);
  if (!created.data) throw new Error("Không tạo được server");
  return created.data.id as string;
}

function withServer<T extends { character: { server_id?: string } }>(
  payload: T,
  serverId: string,
) {
  return {
    ...payload,
    character: { ...payload.character, server_id: serverId },
  };
}

export async function ensureStarter() {
  const { supabase, user } = await requireUser();
  fail((await supabase.rpc("claim_owner")).error);
  const existing = await supabase
    .from("characters")
    .select("id")
    .order("last_opened_at", { ascending: false })
    .limit(1);
  fail(existing.error);
  if (existing.data?.[0]) return existing.data[0].id as string;
  const serverId = await firstServerId(supabase, user.id);
  const created = await supabase.rpc("create_character", {
    payload: withServer(starterPayload(), serverId),
  });
  fail(created.error);
  return created.data as string;
}

export async function createBlankCharacter(name: string, serverId: string) {
  const { supabase } = await requireUser();
  const created = await supabase.rpc("create_character", {
    payload: withServer(
      blankPayload(z.string().min(1).max(80).parse(name)),
      z.string().uuid().parse(serverId),
    ),
  });
  fail(created.error);
  refresh();
  return created.data as string;
}

export async function duplicateCharacter(id: string, name: string) {
  const { supabase } = await requireUser();
  const created = await supabase.rpc("duplicate_character", {
    p_source: id,
    p_name: z.string().min(1).max(80).parse(name),
  });
  fail(created.error);
  refresh();
  return created.data as string;
}

export async function deleteCharacter(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("characters").delete().eq("id", id)).error);
  refresh();
}

export async function exportCharacter(id: string) {
  return studioToLegacy(await loadStudio(id));
}

export async function importCharacter(id: string, raw: unknown) {
  const payload = legacyToPayload(mergeLegacy(raw));
  const { supabase } = await requireUser();
  fail((await supabase.rpc("replace_character", { p_id: id, payload })).error);
  refresh(id);
}
