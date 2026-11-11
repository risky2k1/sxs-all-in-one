"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOwner } from "@/shared/api/studio/session";

const keySchema = z.string().min(1).max(80);

export async function uploadAsset(formData: FormData) {
  const key = keySchema.parse(formData.get("key"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    throw new Error("Chọn một file ảnh");
  if (file.size > 2_000_000) throw new Error("Ảnh lớn hơn 2MB");
  const type = file.type;
  const ext =
    type === "image/png"
      ? "png"
      : type === "image/webp"
        ? "webp"
        : type === "image/jpeg"
          ? "jpg"
          : "";
  if (!ext) throw new Error("Chỉ nhận PNG, WEBP hoặc JPEG");
  const path = `${key}.${ext}`;
  const { supabase } = await requireOwner();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploaded = await supabase.storage
    .from("game-assets")
    .upload(path, bytes, {
      upsert: true,
      contentType: type,
    });
  if (uploaded.error) throw new Error(uploaded.error.message);
  const saved = await supabase
    .from("catalog_assets")
    .update({ storage_path: path })
    .eq("key", key);
  if (saved.error) throw new Error(saved.error.message);
  revalidatePath("/admin/assets");
  revalidatePath("/", "layout");
}

export async function resetAsset(formData: FormData) {
  const key = keySchema.parse(formData.get("key"));
  const { supabase } = await requireOwner();
  const current = await supabase
    .from("catalog_assets")
    .select("storage_path")
    .eq("key", key)
    .maybeSingle();
  if (current.error) throw new Error(current.error.message);
  if (current.data?.storage_path) {
    await supabase.storage
      .from("game-assets")
      .remove([current.data.storage_path]);
  }
  const saved = await supabase
    .from("catalog_assets")
    .update({ storage_path: null })
    .eq("key", key);
  if (saved.error) throw new Error(saved.error.message);
  revalidatePath("/admin/assets");
  revalidatePath("/", "layout");
}
