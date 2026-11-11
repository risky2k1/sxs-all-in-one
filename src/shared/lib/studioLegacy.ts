import type { CharacterRow, Studio } from "@/shared/api/studio/studio.types";
import { serverDay } from "@/shared/lib/serverDay";
import type { LegacyState } from "@/shared/lib/legacy.types";

function profileOf(c: CharacterRow): LegacyState["profile"] {
  return {
    playerName: c.name,
    serverDay: c.servers ? serverDay(c.servers.opened_on) : 1,
    level: c.level,
    combatPower: c.combat_power,
    currentClass: c.current_class,
    rankTier: c.rank_tier,
    totalJobLevel: c.total_job_level,
    warriorJobLevel: c.warrior_job_level,
    mageJobLevel: c.mage_job_level,
    duelistJobLevel: c.duelist_job_level,
    currentMap: c.current_map,
    mirageTower: c.mirage_tower,
    dailyDungeonStatus: c.daily_dungeon_status,
    spendingTier: c.spending_tier,
  };
}

function resourcesOf(c: CharacterRow): LegacyState["resources"] {
  return {
    gold: c.gold,
    morningStar: c.morning_star,
    coloredDiamond: c.colored_diamond,
    stamina: c.stamina,
    battleEssence: c.battle_essence,
    normalPrayerTickets: c.normal_prayer_tickets,
    classPrayerTickets: c.class_prayer_tickets,
    skillSelectTickets: c.skill_select_tickets,
    prayerProgress: c.prayer_progress,
    secretRealmTotal: c.secret_realm_total,
    hammerStone: c.hammer_stone,
    pickaxeGold: c.pickaxe_gold,
    gloveEssence: c.glove_essence,
    shovelSand: c.shovel_sand,
    dailyBuyPattern: c.daily_buy_pattern,
    fateFruits: c.fate_fruits,
    timeCrystals: c.time_crystals,
  };
}

function homesteadOf(c: CharacterRow): LegacyState["homestead"] {
  return {
    cartStoneLv: c.cart_stone_lv,
    cartOreLv: c.cart_ore_lv,
    cartWoodLv: c.cart_wood_lv,
    cartSandLv: c.cart_sand_lv,
    cartOtherLv: c.cart_other_lv,
    bedLv: c.bed_lv,
    goddessStatues: c.goddess_statues,
    shopRoutine: c.shop_routine,
  };
}

export function studioToLegacy(studio: Studio): LegacyState {
  const equipment: LegacyState["equipment"] = {};
  for (const item of studio.equipment) {
    equipment[item.slot_key] = {
      name: item.name,
      iconKey: item.icon_key,
      level: item.level,
      quality: item.quality,
      notes: item.notes,
    };
  }
  const skills: LegacyState["skills"] = {};
  for (const skill of studio.skills) {
    skills[skill.skill_id] = {
      owned: skill.owned,
      quality: skill.quality,
      stars: skill.stars,
      equippedSlot: skill.equipped_slot,
    };
  }
  for (const skill of studio.customSkills) {
    skills[skill.id] = {
      owned: skill.owned,
      quality: skill.quality,
      stars: skill.stars,
      equippedSlot: skill.equipped_slot,
    };
  }
  return {
    profile: profileOf(studio.character),
    equipment,
    skillSlotsLevel: studio.skillSlots.map((slot) => ({
      slot: slot.slot_index,
      type: slot.slot_kind,
      level: slot.level,
    })),
    skills,
    resources: resourcesOf(studio.character),
    companionsPets: {
      companions: studio.companions
        .filter((companion) => companion.opened)
        .map((companion) => ({
          id: companion.companion_id,
          name: companion.name,
          giftType: companion.gift_type,
          stats: companion.stats,
          level: companion.level,
          priority: companion.priority,
        })),
      selectedPet: studio.character.selected_pet,
      petStatus: studio.character.pet_status,
      relicProgress: studio.character.relic_progress,
    },
    homestead: homesteadOf(studio.character),
    customQuestion: studio.character.custom_question,
    customSkillsList: studio.customSkills.map((skill) => ({
      id: skill.id,
      tierClass: skill.tier_class,
      type: skill.skill_type,
      vn: skill.vn,
      en: skill.en,
      cn: skill.cn,
      cd: skill.cd,
      element: skill.element,
      tier: skill.tier,
      desc: skill.description,
    })),
  };
}
