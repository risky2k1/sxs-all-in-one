"use client";

import type { FantomonCard, Studio } from "@/shared/api/studio/studio.types";
import { GameIcon } from "@/shared/ui/game-icon";
import { QualityRadios, StarRow } from "@/shared/ui/quality-picker";
import { cn } from "@/shared/lib/utils";

export function FantomonCardView({
  pet,
  studio,
  onSave,
}: {
  pet: FantomonCard;
  studio: Studio;
  onSave: (
    pet: FantomonCard,
    patch: {
      owned?: boolean;
      quality?: string;
      stars?: number;
    },
  ) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({ id: pet.id, kind: "fantomon" }),
        );
      }}
      className={cn(
        "flex flex-col gap-2 border-2 border-border p-3",
        !pet.owned && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <GameIcon
          assets={studio.assets}
          iconKey={pet.iconKey}
          supabaseUrl={studio.supabaseUrl}
          alt={pet.name}
        />
        <div>
          <p className="font-heading">{pet.name}</p>
          <p className="text-sm">{pet.role}</p>
        </div>
        <label className="ml-auto flex flex-col items-center text-base font-heading">
          <input
            type="checkbox"
            className="size-6"
            checked={pet.owned}
            onChange={(event) => onSave(pet, { owned: event.target.checked })}
          />
          Owned
        </label>
      </div>
      <QualityRadios
        name={`fantomon-${pet.id}`}
        value={pet.quality}
        onChange={(quality) => onSave(pet, { quality })}
      />
      <StarRow value={pet.stars} onChange={(stars) => onSave(pet, { stars })} />
    </article>
  );
}
