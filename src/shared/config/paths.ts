export const PATHS = {
  home: "/",
  login: "/login",
  characters: "/characters",
  adminAssets: "/admin/assets",
  tab: (id: string, tab: StudioTab) => `/c/${id}/${tab}`,
} as const;

export const STUDIO_TABS = [
  "overview",
  "skills",
  "equipment",
  "resources",
  "companions",
  "prompt",
] as const;

export type StudioTab = (typeof STUDIO_TABS)[number];

export function tabFromPath(path: string): StudioTab {
  return STUDIO_TABS.find((tab) => path.endsWith(`/${tab}`)) ?? "overview";
}
