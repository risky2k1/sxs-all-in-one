import type { Studio } from "@/shared/api/studio/studio.types";

export type SkillCardModel = {
  id: string;
  custom: boolean;
  type: "active" | "passive";
  tierClass: string;
  vn: string;
  en: string;
  cn: string;
  element: string;
  tier: string;
  owned: boolean;
  quality: string;
  stars: number;
  equippedSlot: number;
  iconKey: string;
};

export function mergeSkills(studio: Studio): SkillCardModel[] {
  const saved = new Map(studio.skills.map((skill) => [skill.skill_id, skill]));
  const catalog = studio.catalog.map((skill) => {
    const state = saved.get(skill.id);
    return {
      id: skill.id,
      custom: false,
      type: skill.skill_type,
      tierClass: skill.tier_class,
      vn: skill.vn,
      en: skill.en,
      cn: skill.cn,
      element: skill.element,
      tier: skill.tier,
      owned: state?.owned ?? false,
      quality: state?.quality ?? "Epic",
      stars: state?.stars ?? 1,
      equippedSlot: state?.equipped_slot ?? 0,
      iconKey: skill.icon_key,
    };
  });
  const custom = studio.customSkills.map((skill) => ({
    id: skill.id,
    custom: true,
    type: skill.skill_type,
    tierClass: skill.tier_class,
    vn: skill.vn,
    en: skill.en,
    cn: skill.cn,
    element: skill.element,
    tier: skill.tier,
    owned: skill.owned,
    quality: skill.quality,
    stars: skill.stars,
    equippedSlot: skill.equipped_slot,
    iconKey: skill.icon_key,
  }));
  return [...catalog, ...custom];
}

export function skillInSlot(
  skills: SkillCardModel[],
  type: SkillCardModel["type"],
  slot: number,
  pendingClear: readonly string[] = [],
) {
  return skills.find(
    (skill) =>
      skill.type === type &&
      skill.equippedSlot === slot &&
      !pendingClear.includes(skill.id),
  );
}
