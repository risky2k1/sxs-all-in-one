export const CLASS_OPTIONS = [
  "Warrior",
  "Mage",
  "Knight",
  "Duelist",
  "Sorcerer",
  "Sage",
  "Paladin",
  "Berserker",
  "Archmage",
  "Arcanist",
  "Guardian",
  "Conqueror",
  "Destroyer",
  "Dominator",
] as const;

export const SPENDING_OPTIONS = [
  "F2P",
  "Light spend / monthly card",
  "Medium spend",
  "Heavy spend",
] as const;

export const QUALITIES = [
  "Rare",
  "Epic",
  "Legendary",
  "Mythic",
  "Divine",
] as const;

export const QUALITY_CLASS: Record<(typeof QUALITIES)[number], string> = {
  Rare: "text-blue-700",
  Epic: "text-purple-700",
  Legendary: "text-orange-600",
  Mythic: "text-yellow-500",
  Divine: "text-red-600",
};

export const EQUIPMENT_SLOTS = [
  "weapon",
  "subWeapon",
  "helmet",
  "armor",
  "boots",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];
