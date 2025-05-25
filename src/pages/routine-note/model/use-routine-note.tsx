import { RoutineNote } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { createStoreContext } from "@/shared/zustand/create-store-context";
import { useEffect, useState } from "react";
import { ensureRoutineNote } from "./ensure-routine-note";


interface RoutineNoteStore {
  note: RoutineNote;
  setNote(note: RoutineNote): void;
  setNote(day: Day): void;
}

const [Provider, useStore] = createStoreContext<RoutineNote, RoutineNoteStore>((routineNote, set, get) => ({
  note: routineNote,

  async setNote(noteOrDay: RoutineNote | Day) {
    let note: RoutineNote;
    if (noteOrDay instanceof Day) {
      note = await ensureRoutineNote(noteOrDay);
    } else {
      note = noteOrDay;
    }
    set({ note });
  },

}));


interface Props {
  day: Day;
  children?: React.ReactNode;
}
export const RoutineNoteStoreProvider = ({ day, children }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState<RoutineNote | null>(null);

  useEffect(() => {
    if (!isLoading) return;

    const load = async () => {
      const routineNote = await ensureRoutineNote(day);
      setNote(routineNote);
      setIsLoading(false);
    }
    load();
  }, [day, isLoading]);

  if (!note || isLoading) return (<div>Routine Note Loading...</div>);

  return (
    <Provider
      data={note}
      onDataChange={(s, note) => s.setState({
        note: note
      })}
    >
      {children}
    </Provider>
  );
};

export const useRoutineNoteStore = useStore;