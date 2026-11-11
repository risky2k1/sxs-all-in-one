import starterJson from "@/shared/config/starter.json";

import type { CharacterPayload } from "@/shared/lib/characterPayload";

const starter = starterJson as CharacterPayload;

export function starterPayload(
  name = starter.character.name,
): CharacterPayload {
  return {
    ...structuredClone(starter),
    character: { ...starter.character, name },
  };
}

export function blankPayload(name: string): CharacterPayload {
  const base = starterPayload(name);
  const character = base.character;
  return {
    ...base,
    character: {
      ...character,
      name,
      server_day: 1,
      level: 1,
      combat_power: "0",
      current_class: "Warrior",
      rank_tier: "",
      total_job_level: 1,
      warrior_job_level: 1,
      mage_job_level: 0,
      duelist_job_level: 0,
      current_map: "",
      mirage_tower: "",
      daily_dungeon_status: "",
      spending_tier: "F2P",
      gold: "0",
      morning_star: "0",
      colored_diamond: "0",
      stamina: "0",
      battle_essence: "0",
      normal_prayer_tickets: 0,
      class_prayer_tickets: 0,
      skill_select_tickets: 0,
      prayer_progress: "",
      secret_realm_total: 0,
      hammer_stone: 0,
      pickaxe_gold: 0,
      glove_essence: 0,
      shovel_sand: 0,
      daily_buy_pattern: "",
      fate_fruits: 0,
      time_crystals: 0,
      selected_pet: "",
      pet_status: "",
      relic_progress: "",
      cart_stone_lv: 1,
      cart_ore_lv: 1,
      cart_wood_lv: 1,
      cart_sand_lv: 1,
      cart_other_lv: 1,
      bed_lv: 1,
      goddess_statues: "",
      shop_routine: "",
      custom_question: "",
    },
    equipment: base.equipment.map((item) => ({
      ...item,
      level: 0,
      quality: "Rare",
      notes: "",
    })),
    skill_slots: base.skill_slots.map((slot) => ({ ...slot, level: 1 })),
    skills: [],
    companions: base.companions.map((companion) => ({
      ...companion,
      level: 1,
      priority: "",
    })),
    custom_skills: [],
  };
}
