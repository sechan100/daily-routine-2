import { RoutineNote } from "@entities/note";
import { createStoreContext } from "@shared/zustand/create-store-context";
import { Day } from "@shared/period/day";
import { resolveRoutineNote } from "./resolve-note";


interface UseRoutineNote {
  note: RoutineNote;
  setNote(note: RoutineNote): void;
  setNote(day: Day): void;
}

export const [UseRoutineNoteProvider, useRoutineNote] = 
createStoreContext<RoutineNote, UseRoutineNote>((routineNote, set, get) => ({
  note: routineNote,

  async setNote(noteOrDay: RoutineNote | Day){
    let note: RoutineNote;
    if(noteOrDay instanceof Day){
      note = await resolveRoutineNote(noteOrDay);
    } else {
      note = noteOrDay;
    }
    set({ note });
  },


}));