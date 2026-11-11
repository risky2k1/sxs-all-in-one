export const LOADOUT_PRESETS = {
  r2_aoe_flame: {
    active: [
      "r2_flame_aura",
      "r1_whirlwind",
      "r2_sunset_sword",
      "r2_flash_dash",
    ],
    passive: [
      "r1_block_awareness",
      "r2_indomitable_will",
      "r1_blade_of_lament",
      "r1_insightful_eye",
    ],
  },
  r2_single_boss: {
    active: [
      "r1_leap_attack",
      "r2_flame_aura",
      "r2_darkness",
      "r1_heavy_impact",
    ],
    passive: [
      "r1_insightful_eye",
      "r2_crit_mastery",
      "r1_blade_of_lament",
      "r2_indomitable_will",
    ],
  },
} as const;

export type PresetKey = keyof typeof LOADOUT_PRESETS;
