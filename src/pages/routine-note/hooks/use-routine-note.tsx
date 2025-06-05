import { mergeRoutineMutations, RoutineNote } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { createStoreContext } from "@/shared/zustand/create-store-context";
import { useEffect, useState } from "react";
import { ensureRoutineNote } from "../model/ensure-routine-note";


export type RoutineNoteStore = {
  note: RoutineNote;
  actions: {
    setNote(note: RoutineNote): void;
    setNote(day: Day): Promise<void>;
    /**
     * mergeRoutineMutations 함수를 호출하여 routine의 변경사항을 모든 노트들에 병합한다.
     * 병합된 이후에 현재 note의 day와 일치하는 updated된 note로 상태를 업데이트한다.
     */
    merge: () => void;
  }
}

const [Provider, useStore] = createStoreContext<RoutineNote, RoutineNoteStore>((routineNote, set, get) => ({
  note: routineNote,
  actions: {
    setNote: async (noteOrDay: RoutineNote | Day) => {
      let note: RoutineNote;
      if (noteOrDay instanceof Day) {
        note = await ensureRoutineNote(noteOrDay);
      } else {
        note = noteOrDay;
      }
      set({ note });
    },
    merge: async () => {
      const note = get().note;
      if (!note) return;
      await mergeRoutineMutations();
      await get().actions.setNote(note.day);
    }
  }
}));

export const useRoutineNoteStore = useStore;


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
}