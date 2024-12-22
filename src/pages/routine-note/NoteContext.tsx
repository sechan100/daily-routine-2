import { RoutineNote } from "@entities/note";
import { resolveRoutineNote, UseRoutineNoteProvider } from "@features/note";
import { Day } from "@shared/period/day";
import { useState, useEffect } from "react";
import { RoutineNoteContent } from "./RoutineNoteContent";


interface Props {
  day: Day;
  children?: React.ReactNode;
}
export const NoteContext = ({ day, children }: Props) => {
  const [note, setNote] = useState<RoutineNote | null>(null);

  useEffect(() => {
    (async () => {
      const routineNote = await resolveRoutineNote(day);
      setNote(routineNote);
    })();
  }, [day]);

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
