import { mergeRoutineMutations, RoutineNote } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { createStoreContext } from "@/shared/zustand/create-store-context";
import { useCallback, useEffect, useState } from "react";
import { ensureRoutineNote } from "./ensure-routine-note";


interface RoutineNoteStore {
  note: RoutineNote;
}

const [Provider, useStore] = createStoreContext<RoutineNote, RoutineNoteStore>((routineNote, set, get) => ({
  note: routineNote,
}));

export const useRoutineNoteStore = useStore;

export type RoutineNoteStoreActions = {
  setNote(note: RoutineNote): void;
  setNote(day: Day): Promise<void>;

  /**
   * mergeRoutineMutations 함수를 호출하여 routine의 변경사항을 모든 노트들에 병합한다.
   * 병합된 이후에 현재 note의 day와 일치하는 updated된 note로 상태를 업데이트한다.
   */
  merge: () => void;
}
export const useRoutineNoteStoreActions = (): RoutineNoteStoreActions => {

  const setNote = useCallback(async (noteOrDay: RoutineNote | Day) => {
    let note: RoutineNote;
    if (noteOrDay instanceof Day) {
      note = await ensureRoutineNote(noteOrDay);
    } else {
      note = noteOrDay;
    }
    useRoutineNoteStore.setState({ note });
  }, []);

  const merge = useCallback(async () => {
    const note = useRoutineNoteStore.getState().note;
    if (!note) return;

    await mergeRoutineMutations();
    await setNote(note.day);
  }, [setNote]);

  return {
    setNote,
    merge,
  }
}

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