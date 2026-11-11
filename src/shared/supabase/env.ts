export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

export function supabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}
