import { cache } from "react";
import { notFound } from "next/navigation";

import type {
  AssetRow,
  CatalogSkill,
  CharacterRow,
  CharacterSummary,
  CustomSkillRow,
  EquipmentRow,
  FantomonCard,
  SkillSlotRow,
  SkillStateRow,
  Studio,
  GameServer,
} from "@/shared/api/studio/studio.types";
import { requireUser } from "@/shared/api/studio/session";
import { supabaseUrl } from "@/shared/supabase/env";

export const loadStudio = cache(async (id: string): Promise<Studio> => {
  const { supabase } = await requireUser();
  const characterQuery = await supabase
    .from("characters")
    .select("*, servers(id, name, opened_on)")
    .eq("id", id)
    .maybeSingle();
  if (!characterQuery.data) notFound();

  const [
    ,
    equipment,
    skillSlots,
    skills,
    customSkills,
    companionRows,
    defs,
    fantomonCatalog,
    fantomonStates,
    catalog,
    assets,
    characters,
    servers,
    owner,
  ] = await Promise.all([
    supabase
      .from("characters")
      .update({ last_opened_at: new Date().toISOString() })
      .eq("id", id),
    supabase.from("character_equipment").select("*").eq("character_id", id),
    supabase
      .from("character_skill_slots")
      .select("*")
      .eq("character_id", id)
      .order("slot_index"),
    supabase.from("character_skills").select("*").eq("character_id", id),
    supabase.from("character_custom_skills").select("*").eq("character_id", id),
    supabase.from("character_companions").select("*").eq("character_id", id),
    supabase.from("companion_defs").select("*").order("sort_order"),
    supabase.from("catalog_fantomons").select("*").order("name"),
    supabase.from("character_fantomons").select("*").eq("character_id", id),
    supabase.from("catalog_skills").select("*").order("tier_class"),
    supabase.from("catalog_assets").select("*").order("category"),
    supabase
      .from("characters")
      .select("id, name, server_id")
      .order("last_opened_at", { ascending: false }),
    supabase
      .from("servers")
      .select("id, name, opened_on")
      .order("opened_on", { ascending: true }),
    supabase.rpc("is_owner"),
  ]);

  const roster = buildRoster(
    defs.data,
    companionRows.data,
    fantomonCatalog.data,
    fantomonStates.data,
  );

  return {
    character: characterQuery.data as CharacterRow,
    equipment: (equipment.data ?? []) as EquipmentRow[],
    skillSlots: (skillSlots.data ?? []) as SkillSlotRow[],
    skills: (skills.data ?? []) as SkillStateRow[],
    customSkills: (customSkills.data ?? []) as CustomSkillRow[],
    companions: roster.companions,
    fantomons: roster.fantomons,
    catalog: (catalog.data ?? []) as CatalogSkill[],
    assets: (assets.data ?? []) as AssetRow[],
    characters: (characters.data ?? []) as CharacterSummary[],
    servers: (servers.data ?? []) as GameServer[],
    isOwner: owner.data === true,
    supabaseUrl: supabaseUrl(),
  };
});

function buildRoster(
  defRows:
    | {
        id: string;
        name: string;
        gift_type: string;
        stats: string;
        icon_key: string | null;
      }[]
    | null,
  companionRows:
    | {
        character_id: string;
        companion_id: string;
        level: number;
        priority: string;
      }[]
    | null,
  catalogRows:
    { id: string; name: string; role: string; icon_key: string }[] | null,
  stateRows:
    | {
        fantomon_id: string;
        owned: boolean;
        quality: string;
        stars: number;
        equipped_slot: number;
      }[]
    | null,
) {
  const savedCompanions = new Map(
    (companionRows ?? []).map((row) => [row.companion_id, row]),
  );
  const companions = (defRows ?? []).map((def) => {
    const row = savedCompanions.get(def.id);
    return {
      character_id: row?.character_id ?? "",
      companion_id: def.id,
      level: row?.level ?? 0,
      priority: row?.priority ?? "",
      name: def.name,
      gift_type: def.gift_type,
      stats: def.stats,
      icon_key: def.icon_key || "player_avatar",
      opened: Boolean(row),
    };
  });
  const saved = new Map((stateRows ?? []).map((row) => [row.fantomon_id, row]));
  const fantomons: FantomonCard[] = (catalogRows ?? []).map((item) => {
    const state = saved.get(item.id);
    return {
      id: item.id,
      name: item.name,
      role: item.role,
      iconKey: item.icon_key,
      owned: state?.owned ?? false,
      quality: state?.quality ?? "Epic",
      stars: state?.stars ?? 1,
      equippedSlot: state?.equipped_slot ?? 0,
    };
  });
  return { companions, fantomons };
}

export async function listCharacters(): Promise<CharacterSummary[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("characters")
    .select("id, name, server_id")
    .order("last_opened_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CharacterSummary[];
}

export async function listServers() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("servers")
    .select("id, name, opened_on")
    .order("opened_on", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; name: string; opened_on: string }[];
}
