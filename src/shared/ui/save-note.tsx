"use client";

import { useContext, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";

import type { Studio } from "@/shared/api/studio/studio.types";
import { StudioDraftContext } from "@/shared/studio/draft";
import { t } from "@/locales/t";

export type SaveFn = (
  task: () => Promise<void>,
  optimistic?: (studio: Studio) => Studio,
) => Promise<void>;

export function useSave() {
  const router = useRouter();
  const draft = useContext(StudioDraftContext);
  const chain = useRef(Promise.resolve());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const run: SaveFn = (task, optimistic) => {
    let revert: (() => boolean) | undefined;
    flushSync(() => {
      if (optimistic && draft) revert = draft.edit(optimistic);
      setStatus("saving");
    });
    const job = chain.current.then(async () => {
      try {
        await task();
        setStatus("saved");
        if (!optimistic) {
          draft?.allowNext();
          router.refresh();
        }
      } catch {
        const undone = revert?.() ?? false;
        if (!undone && optimistic) {
          draft?.allowNext();
          router.refresh();
        }
        setStatus("error");
      }
    });
    chain.current = job.then(
      () => undefined,
      () => undefined,
    );
    return job;
  };

  return { status, run };
}

export function SaveNote({ status }: { status: string }) {
  return <p className="text-sm font-base">{t(`save.${status}`)}</p>;
}
