import { notFound } from "next/navigation";

import { AssetsView } from "@/features/assets";
import { requireOwner } from "@/shared/api/studio/session";
import type { AssetRow } from "@/shared/api/studio/studio.types";
import { supabaseUrl } from "@/shared/supabase/env";

async function loadAssets() {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("catalog_assets")
    .select("*")
    .order("label");
  if (error) throw new Error(error.message);
  return (data ?? []) as AssetRow[];
}

export default async function Page() {
  const assets = await loadAssets().catch(() => null);
  if (!assets) notFound();
  return <AssetsView assets={assets} supabaseUrl={supabaseUrl()} />;
}
