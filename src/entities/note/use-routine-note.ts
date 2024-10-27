import { createStoreContext } from "shared/zustand/create-store-context";
import { RoutineNote, routineNoteService, Task } from "./routine-note-service";
import { Day } from "shared/day";
import { routineNoteArchiver } from "./routine-note-archive";




interface UseRoutineNote {
  note: RoutineNote;
  setNote(note: RoutineNote): void;
  setNote(day: Day): void;
}

export const { StoreProvider: UseRoutineNoteProvider, useStoreHook: useRoutineNote } = 
createStoreContext<RoutineNote, UseRoutineNote>((note, set, get) => ({
  note: note,

  async setNote(noteOrDay: RoutineNote | Day){
    if(noteOrDay instanceof Day){
      const day = noteOrDay;
      let routineNote = await routineNoteArchiver.load(day);
      if(!routineNote){
        routineNote = await routineNoteService.create(day);
      }
      set({ note: routineNote });
    } else {
      set({ note: noteOrDay });
    }
  },


}));