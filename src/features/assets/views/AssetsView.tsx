import Image from "next/image";

import { resetAsset, uploadAsset } from "@/shared/api/studio/assetActions";
import type { AssetRow } from "@/shared/api/studio/studio.types";
import { assetUrl } from "@/shared/lib/assetUrl";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const GROUPS = ["skill", "gear", "pet", "item", "ui"] as const;

export function AssetsView({
  assets,
  supabaseUrl,
}: {
  assets: AssetRow[];
  supabaseUrl: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <h1 className="font-heading text-2xl">{t("assets.title")}</h1>
      {GROUPS.map((group) => (
        <Card key={group} className="bg-secondary-background">
          <CardHeader>
            <CardTitle>{group}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {assets
              .filter((asset) => asset.category === group)
              .map((asset) => {
                const src = assetUrl(
                  {
                    storagePath: asset.storage_path,
                    defaultPath: asset.default_path,
                  },
                  supabaseUrl,
                );
                return (
                  <article
                    key={asset.key}
                    className="flex flex-col gap-2 border-2 border-border p-3"
                  >
                    <Image
                      src={src}
                      alt={asset.label}
                      width={64}
                      height={64}
                      className="size-16 border-2 border-border object-cover"
                    />
                    <p className="font-heading">{asset.label}</p>
                    <p className="text-sm">
                      {asset.storage_path
                        ? t("assets.usingCustom")
                        : t("assets.usingDefault")}
                    </p>
                    <form action={uploadAsset} className="flex flex-col gap-2">
                      <input type="hidden" name="key" value={asset.key} />
                      <input
                        type="file"
                        name="file"
                        accept="image/png,image/webp,image/jpeg"
                        required
                      />
                      <Button type="submit">{t("assets.upload")}</Button>
                    </form>
                    <form action={resetAsset}>
                      <input type="hidden" name="key" value={asset.key} />
                      <Button type="submit" variant="neutral">
                        {t("assets.reset")}
                      </Button>
                    </form>
                  </article>
                );
              })}
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
