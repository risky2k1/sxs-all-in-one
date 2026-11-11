"use client";

import {
  updateCustomSkill,
  updateSkill,
} from "@/shared/api/studio/gameActions";
import type { Studio } from "@/shared/api/studio/studio.types";
import { patchCatalogSkill, patchCustomSkill } from "@/shared/studio/patch";
import type { SkillCardModel } from "../lib/mergeSkills";
import { GameIcon } from "@/shared/ui/game-icon";
import { QualityRadios, StarRow } from "@/shared/ui/quality-picker";
import { useSave } from "@/shared/ui/save-note";
import { cn } from "@/shared/lib/utils";

export function SkillCard({
  skill,
  studio,
}: {
  skill: SkillCardModel;
  studio: Studio;
}) {
  const { run } = useSave();
  const save = (patch: { owned?: boolean; quality?: string; stars?: number }) =>
    run(
      () =>
        skill.custom
          ? updateCustomSkill(studio.character.id, skill.id, patch)
          : updateSkill(studio.character.id, skill.id, skill.type, patch),
      (current) =>
        skill.custom
          ? patchCustomSkill(current, skill.id, patch)
          : patchCatalogSkill(current, skill.id, skill.type, patch),
    );

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            id: skill.id,
            type: skill.type,
            custom: skill.custom,
          }),
        );
        event.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "flex cursor-grab flex-col gap-2 border-2 border-border bg-secondary-background p-3",
        !skill.owned && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <GameIcon
          assets={studio.assets}
          iconKey={skill.iconKey}
          supabaseUrl={studio.supabaseUrl}
          alt={skill.en}
        />
        <div className="min-w-0">
          <p className="font-heading">{skill.en}</p>
          <p className="text-sm">
            {skill.tierClass} · {skill.element} · {skill.tier}
          </p>
        </div>
        <label className="ml-auto flex shrink-0 flex-col items-center gap-1 text-base font-heading">
          <input
            type="checkbox"
            className="size-6"
            checked={skill.owned}
            onChange={(event) => save({ owned: event.target.checked })}
          />
          Owned
        </label>
      </div>
      <QualityRadios
        name={`quality-${skill.id}`}
        value={skill.quality}
        onChange={(quality) => save({ quality })}
      />
      <StarRow value={skill.stars} onChange={(stars) => save({ stars })} />
    </article>
  );
}
