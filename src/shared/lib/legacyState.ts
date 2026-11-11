import legacyDefault from "@/shared/config/legacy-default.json";

import type { CharacterPayload } from "@/shared/lib/characterPayload";
import type { LegacyState } from "@/shared/lib/legacy.types";

const QUALITY: Record<string, string> = {
  "Lam (Hiếm)": "Rare",
  "Tím (Sử Thi)": "Epic",
  "Cam (Truyền Thuyết)": "Legendary",
  "Vàng (Kỳ Tích)": "Mythic",
  "Đỏ (Thần Thoại)": "Divine",
};

function qualityName(value: string) {
  return QUALITY[value] ?? value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base: unknown, extra: unknown): unknown {
  if (Array.isArray(base) && Array.isArray(extra)) return extra;
  if (!isRecord(base) || !isRecord(extra))
    return extra === undefined ? base : extra;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    out[key] = key in base ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function mergeLegacy(parsed: unknown): LegacyState {
  if (!isRecord(parsed)) throw new Error("JSON không hợp lệ");
  return deepMerge(legacyDefault, parsed) as LegacyState;
}

function characterFrom(state: LegacyState): CharacterPayload["character"] {
  const p = state.profile;
  const r = state.resources;
  const h = state.homestead;
  const cp = state.companionsPets;
  return {
    name: p.playerName,
    server_day: p.serverDay,
    level: p.level,
    combat_power: p.combatPower,
    current_class: p.currentClass,
    rank_tier: p.rankTier,
    total_job_level: p.totalJobLevel,
    warrior_job_level: p.warriorJobLevel,
    mage_job_level: p.mageJobLevel,
    duelist_job_level: p.duelistJobLevel,
    current_map: p.currentMap,
    mirage_tower: p.mirageTower,
    daily_dungeon_status: p.dailyDungeonStatus,
    spending_tier: p.spendingTier,
    gold: r.gold,
    morning_star: r.morningStar,
    colored_diamond: r.coloredDiamond,
    stamina: r.stamina,
    battle_essence: r.battleEssence,
    normal_prayer_tickets: r.normalPrayerTickets,
    class_prayer_tickets: r.classPrayerTickets,
    skill_select_tickets: r.skillSelectTickets,
    prayer_progress: r.prayerProgress,
    secret_realm_total: r.secretRealmTotal,
    hammer_stone: r.hammerStone,
    pickaxe_gold: r.pickaxeGold,
    glove_essence: r.gloveEssence,
    shovel_sand: r.shovelSand,
    daily_buy_pattern: r.dailyBuyPattern,
    fate_fruits: r.fateFruits,
    time_crystals: r.timeCrystals,
    selected_pet: cp.selectedPet,
    pet_status: cp.petStatus,
    relic_progress: cp.relicProgress,
    cart_stone_lv: h.cartStoneLv,
    cart_ore_lv: h.cartOreLv,
    cart_wood_lv: h.cartWoodLv,
    cart_sand_lv: h.cartSandLv,
    cart_other_lv: h.cartOtherLv,
    bed_lv: h.bedLv,
    goddess_statues: h.goddessStatues,
    shop_routine: h.shopRoutine,
    custom_question: state.customQuestion,
  };
}

export function legacyToPayload(state: LegacyState): CharacterPayload {
  const cp = state.companionsPets;
  return {
    character: characterFrom(state),
    equipment: Object.entries(state.equipment).map(([slotKey, item]) => ({
      slot_key: slotKey,
      name: item.name,
      icon_key: item.iconKey,
      level: item.level,
      quality: qualityName(item.quality),
      notes: item.notes,
    })),
    skill_slots: state.skillSlotsLevel.map((slot) => ({
      slot_index: slot.slot,
      slot_kind: slot.type,
      level: slot.level,
    })),
    skills: Object.entries(state.skills)
      .filter(
        ([id]) =>
          !(state.customSkillsList ?? []).some((skill) => skill.id === id),
      )
      .map(([skillId, skill]) => ({
        skill_id: skillId,
        owned: skill.owned,
        quality: qualityName(skill.quality),
        stars: skill.stars,
        equipped_slot: skill.equippedSlot,
      })),
    companions: cp.companions.map((companion) => ({
      companion_id: companion.id,
      level: companion.level,
      priority: companion.priority,
    })),
    custom_skills: (state.customSkillsList ?? []).map((skill) => {
      const owned = state.skills[skill.id];
      return {
        vn: skill.vn,
        en: skill.en,
        cn: skill.cn,
        tier_class: skill.tierClass,
        skill_type: skill.type,
        element: skill.element,
        cd: skill.cd,
        tier: skill.tier,
        description: skill.desc,
        icon_key: "duelist_hero",
        owned: owned?.owned ?? true,
        quality: qualityName(owned?.quality ?? "Legendary"),
        stars: owned?.stars ?? 1,
        equipped_slot: owned?.equippedSlot ?? 0,
      };
    }),
  };
}
