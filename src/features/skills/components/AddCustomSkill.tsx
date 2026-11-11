"use client";

import { useState } from "react";

import { addCustomSkill } from "@/shared/api/studio/gameActions";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { NativeSelect } from "@/shared/ui/native-select";
import { useSave } from "@/shared/ui/save-note";

export function AddCustomSkill({ characterId }: { characterId: string }) {
  const { run } = useSave();
  const [vn, setVn] = useState("");
  const [en, setEn] = useState("");
  const [tier, setTier] = useState("R2");
  const [kind, setKind] = useState<"active" | "passive">("active");

  return (
    <Card className="bg-secondary-background">
      <CardHeader>
        <CardTitle>{t("skills.add")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Input
          value={vn}
          onChange={(event) => setVn(event.target.value)}
          placeholder="Tên tiếng Việt"
        />
        <Input
          value={en}
          onChange={(event) => setEn(event.target.value)}
          placeholder="Tên tiếng Anh"
        />
        <NativeSelect
          value={tier}
          onChange={(event) => setTier(event.target.value)}
        >
          {["R2", "R3", "R4", "R5+"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={kind}
          onChange={(event) =>
            setKind(event.target.value as "active" | "passive")
          }
        >
          <option value="active">{t("skills.active")}</option>
          <option value="passive">{t("skills.passive")}</option>
        </NativeSelect>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              await addCustomSkill(characterId, {
                vn,
                en,
                tierClass: tier,
                skillType: kind,
              });
              setVn("");
              setEn("");
            })
          }
        >
          {t("skills.add")}
        </Button>
      </CardContent>
    </Card>
  );
}
