import { resonance } from "@/shared/lib/resonance";
import type {
  LegacySkill,
  LegacyState,
  SkillState,
} from "@/shared/lib/legacy.types";

const EMPTY: SkillState = {
  owned: false,
  quality: "Epic",
  stars: 1,
  equippedSlot: 0,
};

function skillState(state: LegacyState, id: string): SkillState {
  return state.skills[id] ?? EMPTY;
}

function catalog(state: LegacyState, extra: LegacySkill[]) {
  return [...extra, ...(state.customSkillsList ?? [])];
}

function slotLines(
  state: LegacyState,
  skills: LegacySkill[],
  type: LegacySkill["type"],
  label: string,
) {
  return [1, 2, 3, 4]
    .map((slot) => {
      const skill = skills.find(
        (item) =>
          item.type === type &&
          skillState(state, item.id).equippedSlot === slot,
      );
      if (!skill) return `  - ${label} #${slot}: [Empty]`;
      const owned = skillState(state, skill.id);
      return `  - ${label} #${slot}: ${skill.en} — [${owned.quality} ${owned.stars}★ | ${skill.tierClass} | ${skill.element} | ${skill.cd}]`;
    })
    .join("\n");
}

function bagLines(state: LegacyState, skills: LegacySkill[]) {
  const lines = skills
    .filter((skill) => {
      const owned = skillState(state, skill.id);
      return owned.owned && owned.equippedSlot === 0;
    })
    .map((skill) => {
      const owned = skillState(state, skill.id);
      const kind = skill.type === "active" ? "Technique" : "Charm";
      return `  - [${skill.tierClass} - ${kind}] ${skill.en}: ${owned.quality} ${owned.stars}★ (Tier ${skill.tier})`;
    });
  return lines.join("\n") || "  - (none)";
}

function profileSection(state: LegacyState) {
  const p = state.profile;
  return [
    "1. PROFILE:",
    `- Character: ${p.playerName} | Server Day ${p.serverDay}`,
    `- Level: Lv.${p.level} | Total Power: ${p.combatPower} | Rank: ${p.rankTier}`,
    `- Class: ${p.currentClass}`,
    `- Class levels: Total ${p.totalJobLevel} (Warrior Lv.${p.warriorJobLevel} | Duelist Lv.${p.duelistJobLevel} | Mage Lv.${p.mageJobLevel})`,
    `- Map: ${p.currentMap}`,
    `- Fantasia Ascent: ${p.mirageTower}`,
    `- Daily Dungeon: ${p.dailyDungeonStatus}`,
    `- Spending: ${p.spendingTier}`,
  ].join("\n");
}

function piece(item: LegacyState["equipment"][string] | undefined) {
  const level = item ? item.level : 0;
  const quality = item ? item.quality : "";
  const notes = item ? item.notes : "";
  return `+${level} (${quality}) - ${notes}`;
}

function gearSection(state: LegacyState) {
  const gear = resonance(
    Object.values(state.equipment).map((item) => item.level),
  );
  const eq = state.equipment;
  const slots = state.skillSlotsLevel
    .map((slot) => {
      const charm = slot.slot > 4;
      const index = charm ? slot.slot - 4 : slot.slot;
      return `${charm ? "Charm" : "Technique"} #${index}: Lv.${slot.level}`;
    })
    .join(" | ");
  return [
    `2. GEAR (Resonance +${gear.current}):`,
    `- Main Weapon: ${piece(eq.weapon)}`,
    `- Sub Weapon: ${piece(eq.subWeapon)}`,
    `- Helmet: ${piece(eq.helmet)}`,
    `- Armor: ${piece(eq.armor)}`,
    `- Boots: ${piece(eq.boots)}`,
    `- Skill slots: ${slots}`,
  ].join("\n");
}

function resourceSection(state: LegacyState) {
  const r = state.resources;
  return [
    "5. RESOURCES:",
    `- Dawnium: ${r.morningStar} | Luminium: ${r.coloredDiamond} | Rolla: ${r.gold}`,
    `- Stamina: ${r.stamina} | Battle Essence: ${r.battleEssence}`,
    `- Stellatie: ${r.normalPrayerTickets} | Covenite: ${r.classPrayerTickets} | Skill Shard Voucher: ${r.skillSelectTickets}`,
    `- Material Realms (${r.secretRealmTotal}): Iron Hammer ${r.hammerStone} | Gold Pickaxe ${r.pickaxeGold} | Worn Knuckles ${r.gloveEssence} | Sand Shovel ${r.shovelSand}`,
    `- Routine: ${r.dailyBuyPattern}`,
    `- Destiny Fruit: ${r.fateFruits} | Temporal Crystal: ${r.timeCrystals}`,
  ].join("\n");
}

export function buildPrompt(state: LegacyState, extra: LegacySkill[]): string {
  const skills = catalog(state, extra);
  const h = state.homestead;
  const companions = state.companionsPets.companions
    .map(
      (item) =>
        `  - ${item.name} (Gift: ${item.giftType}): Affection ${item.level} [${item.stats}]`,
    )
    .join("\n");
  return [
    "=== BÁO CÁO TRẠNG THÁI TÀI KHOẢN SWORD X STAFF (杖剑传说) ===",
    "",
    profileSection(state),
    "",
    gearSection(state),
    "",
    "3. EQUIPPED SKILLS:",
    "* Technique:",
    slotLines(state, skills, "active", "Technique"),
    "* Charm:",
    slotLines(state, skills, "passive", "Charm"),
    "",
    "4. OWNED, NOT EQUIPPED:",
    bagLines(state, skills),
    "",
    resourceSection(state),
    "",
    "6. COMPANIONS, FANTOMON & RELICS:",
    companions,
    `- Fantomon: ${state.companionsPets.petStatus}`,
    `- Relics: ${state.companionsPets.relicProgress}`,
    "",
    "7. HOME:",
    `- Cart: Stone Lv.${h.cartStoneLv} | Raw Ore Lv.${h.cartOreLv} | Wood Lv.${h.cartWoodLv} | Chrono Sand Lv.${h.cartSandLv} | Other Lv.${h.cartOtherLv}`,
    `- Bed Lv.${h.bedLv} | Goddess Statue: ${h.goddessStatues}`,
    `- Vendor Booth: ${h.shopRoutine}`,
    "",
    "=== YÊU CẦU PHÂN TÍCH & TƯ VẤN LỘ TRÌNH ===",
    state.customQuestion,
  ].join("\n");
}
