"use client";

import { useState } from "react";

import { updateCharacter } from "@/shared/api/studio/characterActions";
import type { Studio } from "@/shared/api/studio/studio.types";
import { buildPrompt } from "../lib/buildPrompt";
import type { LegacySkill } from "@/shared/lib/legacy.types";
import { studioToLegacy } from "@/shared/lib/studioLegacy";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { patchCharacter } from "@/shared/studio/patch";
import { SaveNote, useSave } from "@/shared/ui/save-note";
import { Textarea } from "@/shared/ui/textarea";

function catalogOf(studio: Studio): LegacySkill[] {
  return studio.catalog.map((skill) => ({
    id: skill.id,
    tierClass: skill.tier_class,
    type: skill.skill_type,
    vn: skill.vn,
    en: skill.en,
    cn: skill.cn,
    cd: skill.cd,
    element: skill.element,
    tier: skill.tier,
    desc: skill.description,
  }));
}

export function PromptView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const [copied, setCopied] = useState(false);
  const prompt = buildPrompt(studioToLegacy(studio), catalogOf(studio));

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
  }

  return (
    <Card className="bg-secondary-background">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("prompt.title")}</CardTitle>
        <SaveNote status={status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          rows={4}
          defaultValue={studio.character.custom_question}
          onBlur={(event) => {
            const customQuestion = event.target.value;
            void run(
              () =>
                updateCharacter(studio.character.id, {
                  customQuestion,
                }),
              (current) => patchCharacter(current, { customQuestion }),
            );
          }}
        />
        <div className="flex gap-2">
          <Button type="button" onClick={copy}>
            {copied ? t("prompt.copied") : t("prompt.copy")}
          </Button>
        </div>
        <pre className="overflow-x-auto border-2 border-border bg-background p-3 text-sm whitespace-pre-wrap">
          {prompt}
        </pre>
      </CardContent>
    </Card>
  );
}
