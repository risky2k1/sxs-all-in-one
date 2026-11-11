"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { Studio } from "@/shared/api/studio/studio.types";

type DraftApi = {
  studio: Studio;
  edit: (patch: (studio: Studio) => Studio) => () => boolean;
  allowNext: () => void;
};

export const StudioDraftContext = createContext<DraftApi | null>(null);

export function StudioDraftProvider({
  studio,
  children,
}: {
  studio: Studio;
  children: ReactNode;
}) {
  const [draft, setDraft] = useState(studio);
  const [seen, setSeen] = useState(studio);
  const [takeNext, setTakeNext] = useState(false);

  if (studio !== seen) {
    setSeen(studio);
    if (takeNext || studio.character.id !== seen.character.id) {
      setTakeNext(false);
      setDraft(studio);
    }
  }

  const api: DraftApi = {
    studio: draft,
    edit(patch) {
      let before: Studio | null = null;
      let next: Studio | null = null;
      setDraft((current) => {
        before = current;
        next = patch(current);
        return next;
      });
      return () => {
        let undone = false;
        setDraft((current) => {
          if (next && current === next && before) {
            undone = true;
            return before;
          }
          return current;
        });
        return undone;
      };
    },
    allowNext() {
      setTakeNext(true);
    },
  };

  return (
    <StudioDraftContext.Provider value={api}>
      {children}
    </StudioDraftContext.Provider>
  );
}

export function useDraftStudio(): Studio {
  const draft = useContext(StudioDraftContext);
  if (!draft) throw new Error("StudioDraft thiếu");
  return draft.studio;
}
