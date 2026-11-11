export function assetUrl(
  asset: { storagePath: string | null; defaultPath: string },
  supabaseUrl: string,
): string {
  if (!asset.storagePath) return asset.defaultPath;
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/game-assets/${asset.storagePath}`;
}
