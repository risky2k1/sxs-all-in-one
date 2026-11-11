"use client";

import { useRouter } from "next/navigation";

import {
  deleteCharacter,
  duplicateCharacter,
} from "@/shared/api/studio/characterActions";
import { assignServer } from "@/shared/api/studio/serverActions";
import type {
  CharacterSummary,
  GameServer,
} from "@/shared/api/studio/studio.types";
import { PATHS } from "@/shared/config/paths";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { NativeSelect } from "@/shared/ui/native-select";

export function CharacterList({
  characters,
  servers,
}: {
  characters: CharacterSummary[];
  servers: GameServer[];
}) {
  const router = useRouter();
  return (
    <ul className="flex flex-col gap-2">
      {characters.map((character) => (
        <li
          key={character.id}
          className="flex flex-wrap items-center gap-2 border-2 border-border bg-secondary-background p-2"
        >
          <span className="mr-auto font-heading">{character.name}</span>
          <NativeSelect
            className="w-40"
            value={character.server_id}
            onChange={(event) =>
              assignServer(character.id, event.target.value).then(() =>
                router.refresh(),
              )
            }
          >
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name}
              </option>
            ))}
          </NativeSelect>
          <Button
            type="button"
            variant="neutral"
            onClick={() => router.push(PATHS.tab(character.id, "overview"))}
          >
            {t("characters.open")}
          </Button>
          <Button
            type="button"
            variant="neutral"
            onClick={async () => {
              const id = await duplicateCharacter(
                character.id,
                `${character.name} bản sao`,
              );
              router.push(PATHS.tab(id, "overview"));
            }}
          >
            {t("characters.duplicate")}
          </Button>
          <Button
            type="button"
            variant="neutral"
            onClick={async () => {
              if (!window.confirm(`Xóa ${character.name}?`)) return;
              await deleteCharacter(character.id);
              router.refresh();
            }}
          >
            {t("characters.delete")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
