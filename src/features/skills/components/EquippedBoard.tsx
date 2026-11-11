"use client";

import {
  applyPreset,
  updateCustomSkill,
  updateSkill,
} from "@/shared/api/studio/gameActions";
import type { Studio } from "@/shared/api/studio/studio.types";
import { skillInSlot, type SkillCardModel } from "../lib/mergeSkills";
import {
  patchCatalogSkill,
  patchCustomSkill,
  patchPreset,
} from "@/shared/studio/patch";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { GameIcon } from "@/shared/ui/game-icon";
import { useSave } from "@/shared/ui/save-note";

type DragPayload = { id: string; type: "active" | "passive"; custom: boolean };

export function EquippedBoard({
  studio,
  skills,
}: {
  studio: Studio;
  skills: SkillCardModel[];
}) {
  const { run } = useSave();

  function saveSkill(
    id: string,
    type: "active" | "passive",
    custom: boolean,
    patch: { equippedSlot: number; owned?: boolean },
  ) {
    void run(
      () =>
        custom
          ? updateCustomSkill(studio.character.id, id, patch)
          : updateSkill(studio.character.id, id, type, patch),
      (current) =>
        custom
          ? patchCustomSkill(current, id, patch)
          : patchCatalogSkill(current, id, type, patch),
    );
  }

  function equip(slot: number, slotType: "active" | "passive", raw: string) {
    const payload = JSON.parse(raw) as DragPayload;
    if (payload.type !== slotType) return;
    saveSkill(payload.id, payload.type, payload.custom, {
      equippedSlot: slot,
      owned: true,
    });
  }

  function unequip(skill: SkillCardModel) {
    saveSkill(skill.id, skill.type, skill.custom, { equippedSlot: 0 });
  }

  return (
    <Card className="bg-secondary-background">
      <CardHeader>
        <CardTitle>Equipped</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="neutral"
            onClick={() =>
              run(
                () => applyPreset(studio.character.id, "r2_aoe_flame"),
                (current) => patchPreset(current, "r2_aoe_flame"),
              )
            }
          >
            R2 map / tower
          </Button>
          <Button
            type="button"
            variant="neutral"
            onClick={() =>
              run(
                () => applyPreset(studio.character.id, "r2_single_boss"),
                (current) => patchPreset(current, "r2_single_boss"),
              )
            }
          >
            R2 boss
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(["active", "passive"] as const).map((type) => (
            <SlotColumn
              key={type}
              type={type}
              studio={studio}
              skills={skills}
              onEquip={equip}
              onUnequip={unequip}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SlotColumn({
  type,
  studio,
  skills,
  onEquip,
  onUnequip,
}: {
  type: "active" | "passive";
  studio: Studio;
  skills: SkillCardModel[];
  onEquip: (slot: number, slotType: "active" | "passive", raw: string) => void;
  onUnequip: (skill: SkillCardModel) => void;
}) {
  return (
    <div>
      <p className="mb-1 font-heading">
        {type === "active" ? "Technique" : "Charm"}
      </p>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((slot) => {
          const skill = skillInSlot(skills, type, slot);
          return (
            <div
              key={slot}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onEquip(
                  slot,
                  type,
                  event.dataTransfer.getData("application/json"),
                );
              }}
              className="flex min-h-14 items-center gap-2 border-2 border-dashed border-border p-2"
            >
              {skill ? (
                <GameIcon
                  assets={studio.assets}
                  iconKey={skill.iconKey}
                  supabaseUrl={studio.supabaseUrl}
                  alt={skill.en}
                />
              ) : null}
              <span className="mr-auto">
                #{slot} {skill?.en ?? "Empty"}
              </span>
              {skill ? (
                <button
                  type="button"
                  onClick={() => onUnequip(skill)}
                  aria-label="Unequip"
                >
                  ✕
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
