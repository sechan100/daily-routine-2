import { RoutineNote } from "@entities/note";
import { resolveRoutineNote, UseRoutineNote, UseRoutineNoteProvider } from "@features/note";
import { t } from "@shared/i18n";
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import { useState, useEffect } from "react";
import { StoreApi } from "zustand";
import { NoteSkeleton } from "./NoteSkeleton";


// 이보다 빨리 불러오면 아무것도 바꾸지 않아 깜빡임이 없게 하고, 느릴 때만 스켈레톤을 보인다.
const SKELETON_DELAY_MS = 150;

// 참조가 고정되어야 Provider가 매 렌더마다 store를 다시 set하지 않는다.
const syncNoteStore = (store: StoreApi<UseRoutineNote>, note: RoutineNote) => store.setState({ note });


interface Props {
  day: Day;
  children?: React.ReactNode;
}
export const NoteContext = ({ day, children }: Props) => {
  const [note, setNote] = useState<RoutineNote | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // day가 바뀌어도 이전 노트를 그대로 보여주다가, 새 노트가 준비되면 바꾼다.
  useEffect(() => {
    let cancelled = false;
    setError(null);
    const skeletonTimer = window.setTimeout(() => setShowSkeleton(true), SKELETON_DELAY_MS);
    resolveRoutineNote(day)
      .then(routineNote => {
        if (!cancelled) setNote(routineNote);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err instanceof Error ? err : new Error(String(err));
        new Notice(t("shell.note.loadFailed", { message: e.message }));
        setError(e);
      })
      .finally(() => {
        window.clearTimeout(skeletonTimer);
        if (!cancelled) setShowSkeleton(false);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(skeletonTimer);
    };
  }, [day]);

  if (error) {
    return (
      <div style={{ padding: "1em", color: "var(--text-muted)" }}>
        {t("shell.note.loadFailed", { message: error.message })}
      </div>
    );
  }
  if (!note) return showSkeleton ? <NoteSkeleton /> : null;
  return (
    <UseRoutineNoteProvider
      data={note}
      onDataChange={syncNoteStore}
    >
      {children}
    </UseRoutineNoteProvider>
  );
};
