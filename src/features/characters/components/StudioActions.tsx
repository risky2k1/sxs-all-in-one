"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  exportCharacter,
  importCharacter,
} from "@/shared/api/studio/characterActions";
import type { Studio } from "@/shared/api/studio/studio.types";
import { PATHS, type StudioTab } from "@/shared/config/paths";
import { t } from "@/locales/t";
import { createClient } from "@/shared/supabase/client";
import { Button, buttonVariants } from "@/shared/ui/button";
import { NativeSelect } from "@/shared/ui/native-select";
import { SaveNote, useSave } from "@/shared/ui/save-note";
import { cn } from "@/shared/lib/utils";

export function StudioActions({
  studio,
  active,
}: {
  studio: Studio;
  active: StudioTab;
}) {
  const router = useRouter();
  const { run, status } = useSave();
  const character = studio.character;

  async function onExport() {
    const data = await exportCharacter(character.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${character.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <NativeSelect
        className="w-48"
        value={character.id}
        onChange={(event) => router.push(PATHS.tab(event.target.value, active))}
      >
        {studio.characters.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </NativeSelect>
      <Link
        href={PATHS.characters}
        className={cn(buttonVariants({ variant: "neutral", size: "sm" }))}
      >
        {t("nav.characters")}
      </Link>
      {studio.isOwner ? (
        <Link
          href={PATHS.adminAssets}
          className={cn(buttonVariants({ variant: "neutral", size: "sm" }))}
        >
          {t("nav.assets")}
        </Link>
      ) : null}
      <Button type="button" variant="neutral" size="sm" onClick={onExport}>
        {t("io.export")}
      </Button>
      <label className={cn(buttonVariants({ variant: "neutral", size: "sm" }))}>
        {t("io.import")}
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void run(async () => {
              await importCharacter(
                character.id,
                JSON.parse(await file.text()),
              );
            });
          }}
        />
      </label>
      <Button
        type="button"
        variant="neutral"
        size="sm"
        onClick={async () => {
          await createClient().auth.signOut();
          router.push(PATHS.login);
          router.refresh();
        }}
      >
        {t("nav.logout")}
      </Button>
      <SaveNote status={status} />
    </>
  );
}
