import { RoutineNote } from "@entities/note";
import { createStoreContext } from "@shared/zustand/create-store-context";
import { Day } from "@shared/period/day";
import { resolveRoutineNote } from "./resolve-note";


interface UseRoutineNote {
  note: RoutineNote;
  setNote(this: void, note: RoutineNote): void;
  setNote(this: void, day: Day): void;
}

export const [UseRoutineNoteProvider, useRoutineNote] =
createStoreContext<RoutineNote, UseRoutineNote>((routineNote, set) => {
  // setNote 호출 순서를 추적하여, 늦게 resolve된 이전 요청이 최신 상태를 덮어쓰지 않도록 한다.
  let lastSetNoteId = 0;

  return {
    note: routineNote,

    setNote(noteOrDay: RoutineNote | Day){
      const id = ++lastSetNoteId;
      if(noteOrDay instanceof Day){
        void resolveRoutineNote(noteOrDay).then((note) => {
          if(id !== lastSetNoteId) return;
          set({ note });
        });
      } else {
        set({ note: noteOrDay });
      }
    },


  };
});