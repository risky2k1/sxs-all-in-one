"use server";

import { z } from "zod";

import { createAdminClient } from "@/shared/supabase/admin";

export async function registerOwner(email: string, password: string) {
  const parsed = z
    .object({
      email: z.email(),
      password: z.string().min(8).max(72),
    })
    .parse({ email, password });
  const admin = createAdminClient();
  const exists = await admin.rpc("owner_exists");
  if (exists.error) throw new Error(exists.error.message);
  if (exists.data === true) throw new Error("Đã có tài khoản chủ");
  const created = await admin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    throw new Error(created.error?.message ?? "Không tạo được tài khoản");
  }
  const saved = await admin.from("app_owner").insert({
    id: 1,
    owner_user_id: created.data.user.id,
  });
  if (saved.error) throw new Error(saved.error.message);
}

export async function ownerExists() {
  const admin = createAdminClient();
  const exists = await admin.rpc("owner_exists");
  if (exists.error) throw new Error(exists.error.message);
  return exists.data === true;
}
