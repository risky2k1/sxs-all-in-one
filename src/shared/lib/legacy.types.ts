export type SkillState = {
  owned: boolean;
  quality: string;
  stars: number;
  equippedSlot: number;
};

export type LegacySkill = {
  id: string;
  tierClass: string;
  type: "active" | "passive";
  vn: string;
  en: string;
  cn: string;
  cd: string;
  element: string;
  tier: string;
  desc: string;
};

export type LegacyState = {
  profile: {
    playerName: string;
    serverDay: number;
    level: number;
    combatPower: string;
    currentClass: string;
    rankTier: string;
    totalJobLevel: number;
    warriorJobLevel: number;
    mageJobLevel: number;
    duelistJobLevel: number;
    currentMap: string;
    mirageTower: string;
    dailyDungeonStatus: string;
    spendingTier: string;
  };
  equipment: Record<
    string,
    {
      name: string;
      iconKey: string;
      level: number;
      quality: string;
      notes: string;
    }
  >;
  skillSlotsLevel: { slot: number; type: string; level: number }[];
  skills: Record<string, SkillState>;
  resources: {
    gold: string;
    morningStar: string;
    coloredDiamond: string;
    stamina: string;
    battleEssence: string;
    normalPrayerTickets: number;
    classPrayerTickets: number;
    skillSelectTickets: number;
    prayerProgress: string;
    secretRealmTotal: number;
    hammerStone: number;
    pickaxeGold: number;
    gloveEssence: number;
    shovelSand: number;
    dailyBuyPattern: string;
    fateFruits: number;
    timeCrystals: number;
  };
  companionsPets: {
    companions: {
      id: string;
      name: string;
      giftType: string;
      stats: string;
      level: number;
      priority: string;
    }[];
    selectedPet: string;
    petStatus: string;
    relicProgress: string;
  };
  homestead: {
    cartStoneLv: number;
    cartOreLv: number;
    cartWoodLv: number;
    cartSandLv: number;
    cartOtherLv: number;
    bedLv: number;
    goddessStatues: string;
    shopRoutine: string;
  };
  customQuestion: string;
  customSkillsList?: LegacySkill[];
};
