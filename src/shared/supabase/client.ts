import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "@/shared/supabase/env";

export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
