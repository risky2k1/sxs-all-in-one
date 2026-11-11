"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CharacterList } from "../components/CharacterList";
import { ServerForm } from "../components/ServerForm";
import { createBlankCharacter } from "@/shared/api/studio/characterActions";
import type {
  CharacterSummary,
  GameServer,
} from "@/shared/api/studio/studio.types";
import { PATHS } from "@/shared/config/paths";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { NativeSelect } from "@/shared/ui/native-select";

export function CharactersView({
  characters,
  servers,
}: {
  characters: CharacterSummary[];
  servers: GameServer[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [serverId, setServerId] = useState(servers[0]?.id ?? "");
  const [error, setError] = useState("");

  async function create() {
    setError("");
    try {
      const id = await createBlankCharacter(name, serverId);
      router.push(PATHS.tab(id, "overview"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <ServerForm onCreated={setServerId} onError={setError} />
      <Card>
        <CardHeader>
          <CardTitle>{t("characters.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("characters.name")}
            />
            <NativeSelect
              className="w-48"
              value={serverId}
              onChange={(event) => setServerId(event.target.value)}
            >
              {servers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name}
                </option>
              ))}
            </NativeSelect>
            <Button type="button" onClick={create}>
              {t("characters.create")}
            </Button>
          </div>
          {error ? <p className="text-sm">{error}</p> : null}
          <CharacterList characters={characters} servers={servers} />
        </CardContent>
      </Card>
    </main>
  );
}
