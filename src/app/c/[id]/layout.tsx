import type { ReactNode } from "react";

import { StudioShell } from "@/features/characters";
import { loadStudio } from "@/shared/api/studio/loadStudio";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studio = await loadStudio(id);
  return <StudioShell studio={studio}>{children}</StudioShell>;
}
