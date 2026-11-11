"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/shared/api/studio/session";

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function createServer(name: string, openedOn: string) {
  const parsed = z
    .object({
      name: z.string().min(1).max(80),
      openedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .parse({ name, openedOn });
  const { supabase, user } = await requireUser();
  const created = await supabase
    .from("servers")
    .insert({
      user_id: user.id,
      name: parsed.name,
      opened_on: parsed.openedOn,
    })
    .select("id")
    .single();
  fail(created.error);
  if (!created.data) throw new Error("Không tạo được server");
  revalidatePath("/characters");
  return created.data.id as string;
}

export async function assignServer(characterId: string, serverId: string) {
  const { supabase } = await requireUser();
  fail(
    (
      await supabase
        .from("characters")
        .update({ server_id: z.string().uuid().parse(serverId) })
        .eq("id", characterId)
    ).error,
  );
  revalidatePath(`/c/${characterId}`, "layout");
  revalidatePath("/characters");
}
