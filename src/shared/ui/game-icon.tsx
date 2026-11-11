import Image from "next/image";

import type { AssetRow } from "@/shared/api/studio/studio.types";
import { assetUrl } from "@/shared/lib/assetUrl";
import { cn } from "@/shared/lib/utils";

export function GameIcon({
  assets,
  iconKey,
  supabaseUrl,
  alt,
  className,
}: {
  assets: AssetRow[];
  iconKey: string;
  supabaseUrl: string;
  alt: string;
  className?: string;
}) {
  const asset = assets.find((item) => item.key === iconKey);
  const src = asset
    ? assetUrl(
        { storagePath: asset.storage_path, defaultPath: asset.default_path },
        supabaseUrl,
      )
    : "/assets/duelist_hero.png";
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={cn("size-10 border-2 border-border object-cover", className)}
    />
  );
}
