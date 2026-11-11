import { redirect } from "next/navigation";

import { ensureStarter } from "@/shared/api/studio/characterActions";
import { PATHS } from "@/shared/config/paths";

export default async function Page() {
  const id = await ensureStarter();
  redirect(PATHS.tab(id, "overview"));
}
