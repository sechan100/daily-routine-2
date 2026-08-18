import { RoutineNote } from "@entities/note";
import { resolveRoutineNote, UseRoutineNoteProvider } from "@features/note";
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import { useState, useEffect } from "react";


interface Props {
  day: Day;
  children?: React.ReactNode;
}
export const NoteContext = ({ day, children }: Props) => {
  const [note, setNote] = useState<RoutineNote | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setNote(null);
    setError(null);
    resolveRoutineNote(day)
      .then(routineNote => {
        if (!cancelled) setNote(routineNote);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err instanceof Error ? err : new Error(String(err));
        new Notice(`[Daily Routine] Failed to load routine note: ${e.message}`);
        setError(e);
      });
    return () => { cancelled = true; };
  }, [day]);

  if (error) {
    return (
      <div style={{ padding: "1em", color: "var(--text-muted)" }}>
        Failed to load routine note: {error.message}
      </div>
    );
  }
  if (!note) return (<div>Loading...</div>);
  return (
    <UseRoutineNoteProvider
      data={note}
      onDataChange={(s, note) => s.setState({
        note: note
      })}
    >
      {children}
    </UseRoutineNoteProvider>
  );
};
