export type GameServer = {
  id: string;
  name: string;
  opened_on: string;
};

export type CharacterRow = {
  id: string;
  user_id: string;
  name: string;
  server_id: string;
  servers: GameServer | null;
  level: number;
  combat_power: string;
  current_class: string;
  rank_tier: string;
  total_job_level: number;
  warrior_job_level: number;
  mage_job_level: number;
  duelist_job_level: number;
  current_map: string;
  mirage_tower: string;
  daily_dungeon_status: string;
  spending_tier: string;
  gold: string;
  morning_star: string;
  colored_diamond: string;
  stamina: string;
  battle_essence: string;
  normal_prayer_tickets: number;
  class_prayer_tickets: number;
  skill_select_tickets: number;
  prayer_progress: string;
  secret_realm_total: number;
  hammer_stone: number;
  pickaxe_gold: number;
  glove_essence: number;
  shovel_sand: number;
  daily_buy_pattern: string;
  fate_fruits: number;
  time_crystals: number;
  selected_pet: string;
  pet_status: string;
  relic_progress: string;
  cart_stone_lv: number;
  cart_ore_lv: number;
  cart_wood_lv: number;
  cart_sand_lv: number;
  cart_other_lv: number;
  bed_lv: number;
  goddess_statues: string;
  shop_routine: string;
  custom_question: string;
};

export type EquipmentRow = {
  character_id: string;
  slot_key: string;
  name: string;
  icon_key: string;
  level: number;
  quality: string;
  notes: string;
};

export type SkillSlotRow = {
  character_id: string;
  slot_index: number;
  slot_kind: string;
  level: number;
};

export type SkillStateRow = {
  character_id: string;
  skill_id: string;
  owned: boolean;
  quality: string;
  stars: number;
  equipped_slot: number;
};

export type CustomSkillRow = {
  id: string;
  character_id: string;
  vn: string;
  en: string;
  cn: string;
  tier_class: string;
  skill_type: "active" | "passive";
  element: string;
  cd: string;
  tier: string;
  description: string;
  icon_key: string;
  owned: boolean;
  quality: string;
  stars: number;
  equipped_slot: number;
};

export type CompanionRow = {
  character_id: string;
  companion_id: string;
  level: number;
  priority: string;
  name: string;
  gift_type: string;
  stats: string;
  icon_key: string;
  opened: boolean;
};

export type FantomonCard = {
  id: string;
  name: string;
  role: string;
  iconKey: string;
  owned: boolean;
  quality: string;
  stars: number;
  equippedSlot: number;
};

export type CatalogSkill = {
  id: string;
  tier_class: string;
  skill_type: "active" | "passive";
  vn: string;
  en: string;
  cn: string;
  cd: string;
  element: string;
  tier: string;
  description: string;
  icon_key: string;
};

export type AssetRow = {
  key: string;
  category: "skill" | "gear" | "pet" | "item" | "ui" | "companion";
  label: string;
  default_path: string;
  storage_path: string | null;
};

export type CharacterSummary = {
  id: string;
  name: string;
  server_id: string;
};

export type Studio = {
  character: CharacterRow;
  equipment: EquipmentRow[];
  skillSlots: SkillSlotRow[];
  skills: SkillStateRow[];
  customSkills: CustomSkillRow[];
  companions: CompanionRow[];
  fantomons: FantomonCard[];
  catalog: CatalogSkill[];
  assets: AssetRow[];
  characters: CharacterSummary[];
  servers: GameServer[];
  isOwner: boolean;
  supabaseUrl: string;
};
