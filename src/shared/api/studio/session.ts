import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/shared/supabase/server";

export async function requireUser(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Chưa đăng nhập");
  return { supabase, user: data.user };
}

export async function requireOwner() {
  const ctx = await requireUser();
  const { data, error } = await ctx.supabase.rpc("is_owner");
  if (error || data !== true)
    throw new Error("Chỉ chủ tài khoản được sửa mục này");
  return ctx;
}
