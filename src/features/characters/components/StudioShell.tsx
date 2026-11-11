"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CompanionsView } from "@/features/companions";
import { EquipmentView } from "@/features/equipment";
import { OverviewView } from "@/features/overview";
import { PromptView } from "@/features/prompt";
import { ResourcesView } from "@/features/resources";
import { SkillsView } from "@/features/skills";
import { StudioActions } from "./StudioActions";
import type { Studio } from "@/shared/api/studio/studio.types";
import { StudioDraftProvider, useDraftStudio } from "@/shared/studio/draft";
import { PATHS, tabFromPath, type StudioTab } from "@/shared/config/paths";
import { serverDay } from "@/shared/lib/serverDay";
import { t } from "@/locales/t";
import { buttonVariants } from "@/shared/ui/button";
import { GameIcon } from "@/shared/ui/game-icon";
import { cn } from "@/shared/lib/utils";

const NAV: { tab: StudioTab; label: string }[] = [
  { tab: "overview", label: "nav.overview" },
  { tab: "skills", label: "nav.skills" },
  { tab: "equipment", label: "nav.equipment" },
  { tab: "resources", label: "nav.resources" },
  { tab: "companions", label: "nav.companions" },
  { tab: "prompt", label: "nav.prompt" },
];

const VIEWS = {
  overview: OverviewView,
  skills: SkillsView,
  equipment: EquipmentView,
  resources: ResourcesView,
  companions: CompanionsView,
  prompt: PromptView,
};

function plainClick(event: {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  button: number;
}) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function StudioShell({
  studio,
  children,
}: {
  studio: Studio;
  children: ReactNode;
}) {
  return (
    <StudioDraftProvider studio={studio}>
      <StudioFrame>{children}</StudioFrame>
    </StudioDraftProvider>
  );
}

function StudioFrame({ children }: { children: ReactNode }) {
  const studio = useDraftStudio();
  const routeTab = tabFromPath(usePathname());
  const [picked, setPicked] = useState<StudioTab | null>(null);
  const active = picked ?? routeTab;
  const character = studio.character;
  const owned =
    studio.skills.filter((skill) => skill.owned).length +
    studio.customSkills.filter((skill) => skill.owned).length;
  const View = VIEWS[active];

  useEffect(() => {
    const onPop = () => setPicked(tabFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <GameIcon
              assets={studio.assets}
              iconKey="player_avatar"
              supabaseUrl={studio.supabaseUrl}
              alt=""
            />
            <div className="mr-auto">
              <h1 className="font-heading text-lg">{t("app.title")}</h1>
              <p className="text-sm">{t("app.subtitle")}</p>
            </div>
            <StudioActions studio={studio} active={active} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-heading">
            <span className="border-2 border-border bg-background px-2 py-1">
              {character.servers?.name ?? "Server"} · Day{" "}
              {character.servers ? serverDay(character.servers.opened_on) : 1} ·
              Lv.{character.level}
            </span>
            <span className="border-2 border-border bg-main px-2 py-1">
              {character.combat_power}
            </span>
            <span className="border-2 border-border bg-background px-2 py-1">
              {character.current_class}
            </span>
            <span className="border-2 border-border bg-background px-2 py-1">
              {character.morning_star} Dawnium
            </span>
            <span className="border-2 border-border bg-background px-2 py-1">
              {owned} kỹ năng
            </span>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.tab}
                href={PATHS.tab(character.id, item.tab)}
                onClick={(event) => {
                  if (plainClick(event)) setPicked(item.tab);
                }}
                className={cn(
                  buttonVariants({
                    variant: item.tab === active ? "default" : "neutral",
                    size: "sm",
                  }),
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
        <View studio={studio} />
        {children}
      </main>
    </div>
  );
}
