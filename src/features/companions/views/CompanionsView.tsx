"use client";

import { updateCompanion } from "@/shared/api/studio/gearActions";
import { updateCharacter } from "@/shared/api/studio/characterActions";
import { uploadAsset } from "@/shared/api/studio/assetActions";
import type { CharacterRow, Studio } from "@/shared/api/studio/studio.types";
import { FantomonBoard } from "../components/FantomonBoard";
import { UnopenedCompanions } from "../components/UnopenedCompanions";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field } from "@/shared/ui/field";
import { GameIcon } from "@/shared/ui/game-icon";
import { Input } from "@/shared/ui/input";
import { patchCharacter } from "@/shared/studio/patch";
import { patchCompanion } from "@/shared/studio/patchGear";
import { SaveNote, useSave } from "@/shared/ui/save-note";

const HOME: {
  key: string;
  label: string;
  value: (c: CharacterRow) => number;
}[] = [
  { key: "cartStoneLv", label: "Stone", value: (c) => c.cart_stone_lv },
  { key: "cartOreLv", label: "Raw Ore", value: (c) => c.cart_ore_lv },
  { key: "cartWoodLv", label: "Wood", value: (c) => c.cart_wood_lv },
  { key: "cartSandLv", label: "Chrono Sand", value: (c) => c.cart_sand_lv },
  { key: "cartOtherLv", label: "Other", value: (c) => c.cart_other_lv },
  { key: "bedLv", label: "Bed", value: (c) => c.bed_lv },
];

export function CompanionsView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const character = studio.character;
  const save = (patch: Record<string, string | number>) =>
    run(
      () => updateCharacter(character.id, patch),
      (current) => patchCharacter(current, patch),
    );

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-secondary-background">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("companions.title")}</CardTitle>
          <SaveNote status={status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {studio.companions
            .filter((companion) => companion.opened)
            .map((companion) => (
              <div
                key={companion.companion_id}
                className="flex flex-wrap items-center gap-3 border-2 border-border p-3"
              >
                <GameIcon
                  assets={studio.assets}
                  iconKey={companion.icon_key || "player_avatar"}
                  supabaseUrl={studio.supabaseUrl}
                  alt={companion.name}
                />
                <form action={uploadAsset} className="flex flex-col gap-1">
                  <input type="hidden" name="key" value={companion.icon_key} />
                  <input
                    type="file"
                    name="file"
                    accept="image/png,image/webp,image/jpeg"
                  />
                  <Button type="submit" size="sm" variant="neutral">
                    Upload
                  </Button>
                </form>
                <div className="mr-auto">
                  <p className="font-heading">{companion.name}</p>
                  <p className="text-sm">Gift: {companion.gift_type}</p>
                  <p className="text-sm">{companion.stats}</p>
                  <p className="text-sm">{companion.priority}</p>
                </div>
                <Field label={t("companions.level")}>
                  <Input
                    type="number"
                    defaultValue={companion.level}
                    onBlur={(event) => {
                      const level = Number(event.target.value);
                      void run(
                        () =>
                          updateCompanion(
                            character.id,
                            companion.companion_id,
                            level,
                          ),
                        (current) =>
                          patchCompanion(
                            current,
                            companion.companion_id,
                            level,
                          ),
                      );
                    }}
                  />
                </Field>
              </div>
            ))}
          <UnopenedCompanions studio={studio} />
        </CardContent>
      </Card>
      <PetAndHome studio={studio} save={save} />
    </div>
  );
}

function PetAndHome({
  studio,
  save,
}: {
  studio: Studio;
  save: (patch: Record<string, string | number>) => void;
}) {
  const character = studio.character;
  return (
    <>
      <FantomonBoard studio={studio} />
      <Card className="bg-secondary-background">
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Field label="Fantomon status">
            <Input
              defaultValue={character.pet_status}
              onBlur={(event) => save({ petStatus: event.target.value })}
            />
          </Field>
          <Field label="Relics">
            <Input
              defaultValue={character.relic_progress}
              onBlur={(event) => save({ relicProgress: event.target.value })}
            />
          </Field>
        </CardContent>
      </Card>
      <Card className="bg-secondary-background">
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {HOME.map((field) => (
            <Field key={field.key} label={field.label}>
              <Input
                type="number"
                defaultValue={field.value(character)}
                onBlur={(event) =>
                  save({ [field.key]: Number(event.target.value) })
                }
              />
            </Field>
          ))}
          <Field label="Goddess Statue">
            <Input
              defaultValue={character.goddess_statues}
              onBlur={(event) => save({ goddessStatues: event.target.value })}
            />
          </Field>
          <Field label="Vendor Booth">
            <Input
              defaultValue={character.shop_routine}
              onBlur={(event) => save({ shopRoutine: event.target.value })}
            />
          </Field>
        </CardContent>
      </Card>
    </>
  );
}
