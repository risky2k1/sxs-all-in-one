"use client";

import { updateFantomon } from "@/shared/api/studio/fantomonActions";
import type { FantomonCard, Studio } from "@/shared/api/studio/studio.types";
import { FantomonCardView } from "./FantomonCard";
import { GameIcon } from "@/shared/ui/game-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { patchFantomon } from "@/shared/studio/patchGear";
import { useSave } from "@/shared/ui/save-note";

const SLOTS = [
  { slot: 1, label: "Main" },
  { slot: 2, label: "Sub 1" },
  { slot: 3, label: "Sub 2" },
  { slot: 4, label: "Sub 3" },
] as const;

export function FantomonBoard({ studio }: { studio: Studio }) {
  const { run } = useSave();
  const pets = [...studio.fantomons].sort(
    (a, b) =>
      Number(b.owned) - Number(a.owned) ||
      rarity(a.role) - rarity(b.role) ||
      a.name.localeCompare(b.name),
  );

  function save(
    pet: FantomonCard,
    patch: {
      owned?: boolean;
      quality?: string;
      stars?: number;
      equippedSlot?: number;
    },
  ) {
    void run(
      () => updateFantomon(studio.character.id, pet.id, patch),
      (current) => patchFantomon(current, pet.id, patch),
    );
  }

  return (
    <Card className="bg-secondary-background">
      <CardHeader>
        <CardTitle>Fantomon</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
          <SlotColumn
            title="Main"
            slots={SLOTS.filter((item) => item.slot === 1)}
            pets={pets}
            studio={studio}
            onDrop={(slot, id) =>
              save(must(pets, id), { equippedSlot: slot, owned: true })
            }
            onClear={(pet) => save(pet, { equippedSlot: 0 })}
          />
          <SlotColumn
            title="Sub"
            slots={SLOTS.filter((item) => item.slot > 1)}
            pets={pets}
            studio={studio}
            onDrop={(slot, id) =>
              save(must(pets, id), { equippedSlot: slot, owned: true })
            }
            onClear={(pet) => save(pet, { equippedSlot: 0 })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {pets.map((pet) => (
            <FantomonCardView
              key={pet.id}
              pet={pet}
              studio={studio}
              onSave={save}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function rarity(role: string) {
  if (role.startsWith("Rainbow")) return 0;
  if (role.startsWith("SSR")) return 1;
  return 2;
}

function must(pets: FantomonCard[], id: string) {
  const pet = pets.find((item) => item.id === id);
  if (!pet) throw new Error("Missing fantomon");
  return pet;
}

function SlotColumn({
  title,
  slots,
  pets,
  studio,
  onDrop,
  onClear,
}: {
  title: string;
  slots: { slot: number; label: string }[];
  pets: FantomonCard[];
  studio: Studio;
  onDrop: (slot: number, id: string) => void;
  onClear: (pet: FantomonCard) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-heading">{title}</p>
      {slots.map((item) => {
        const pet = pets.find((row) => row.equippedSlot === item.slot);
        return (
          <div
            key={item.slot}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const raw = event.dataTransfer.getData("application/json");
              const payload = JSON.parse(raw) as { id?: string; kind?: string };
              if (payload.kind !== "fantomon" || !payload.id) return;
              onDrop(item.slot, payload.id);
            }}
            className="flex min-h-14 items-center gap-2 border-2 border-dashed border-border p-2"
          >
            {pet ? (
              <GameIcon
                assets={studio.assets}
                iconKey={pet.iconKey}
                supabaseUrl={studio.supabaseUrl}
                alt={pet.name}
              />
            ) : null}
            <span className="mr-auto">
              {item.label}: {pet?.name ?? "Empty"}
            </span>
            {pet ? (
              <button
                type="button"
                onClick={() => onClear(pet)}
                aria-label="Unequip"
              >
                ✕
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
