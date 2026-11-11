"use client";

import {
  setAllSkillSlots,
  updateEquipment,
  updateSkillSlot,
} from "@/shared/api/studio/gearActions";
import type { Studio } from "@/shared/api/studio/studio.types";
import { resonance } from "@/shared/lib/resonance";
import {
  patchAllSkillSlots,
  patchEquipment,
  patchSkillSlot,
} from "@/shared/studio/patchGear";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field } from "@/shared/ui/field";
import { GameIcon } from "@/shared/ui/game-icon";
import { Input } from "@/shared/ui/input";
import { QualityRadios } from "@/shared/ui/quality-picker";
import { SaveNote, useSave, type SaveFn } from "@/shared/ui/save-note";

export function EquipmentView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const gear = resonance(studio.equipment.map((item) => item.level));

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-secondary-background">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("equipment.title")}</CardTitle>
          <SaveNote status={status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="border-2 border-border bg-main p-3 text-sm">
            Resonance +{gear.current}. Next +{gear.next}. {gear.advice}
          </p>
          {studio.equipment.map((item) => (
            <div
              key={item.slot_key}
              className="grid gap-2 border-2 border-border p-3 sm:grid-cols-4"
            >
              <div className="flex items-center gap-2 font-heading">
                <GameIcon
                  assets={studio.assets}
                  iconKey={item.icon_key}
                  supabaseUrl={studio.supabaseUrl}
                  alt={item.name}
                />
                {item.name}
              </div>
              <Field label={t("equipment.level")}>
                <Input
                  type="number"
                  defaultValue={item.level}
                  onBlur={(event) => {
                    const level = Number(event.target.value);
                    void run(
                      () =>
                        updateEquipment(studio.character.id, item.slot_key, {
                          level,
                        }),
                      (current) =>
                        patchEquipment(current, item.slot_key, { level }),
                    );
                  }}
                />
              </Field>
              <div className="sm:col-span-2">
                <QualityRadios
                  name={`eq-${item.slot_key}`}
                  value={item.quality}
                  onChange={(quality) =>
                    run(
                      () =>
                        updateEquipment(studio.character.id, item.slot_key, {
                          quality,
                        }),
                      (current) =>
                        patchEquipment(current, item.slot_key, { quality }),
                    )
                  }
                />
              </div>
              <Field label={t("equipment.notes")}>
                <Input
                  defaultValue={item.notes}
                  onBlur={(event) => {
                    const notes = event.target.value;
                    void run(
                      () =>
                        updateEquipment(studio.character.id, item.slot_key, {
                          notes,
                        }),
                      (current) =>
                        patchEquipment(current, item.slot_key, { notes }),
                    );
                  }}
                />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>
      <EssenceSlots studio={studio} run={run} />
    </div>
  );
}

function slotLabel(index: number) {
  const charm = index > 4;
  return `${charm ? "Charm" : "Technique"} #${charm ? index - 4 : index}`;
}

function EssenceSlots({ studio, run }: { studio: Studio; run: SaveFn }) {
  return (
    <Card className="bg-secondary-background">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("equipment.slots")}</CardTitle>
        <Button
          type="button"
          variant="neutral"
          onClick={() => {
            const value = Number(window.prompt("Cấp cho cả 8 ô", "36"));
            if (value)
              void run(
                () => setAllSkillSlots(studio.character.id, value),
                (current) => patchAllSkillSlots(current, value),
              );
          }}
        >
          {t("equipment.applyAll")}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-4">
        {studio.skillSlots.map((slot) => (
          <Field key={slot.slot_index} label={slotLabel(slot.slot_index)}>
            <Input
              type="number"
              defaultValue={slot.level}
              onBlur={(event) => {
                const level = Number(event.target.value);
                void run(
                  () =>
                    updateSkillSlot(
                      studio.character.id,
                      slot.slot_index,
                      level,
                    ),
                  (current) => patchSkillSlot(current, slot.slot_index, level),
                );
              }}
            />
          </Field>
        ))}
      </CardContent>
    </Card>
  );
}
