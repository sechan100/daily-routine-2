/**
 * routine note는 전역적으로 사용하는 상태이기 때문에, 전역 상태로 정의하여 공유할 수 있도록 한다.
 */

import { createStoreContext } from "@shared/zustand/create-store-context";
import { RoutineNote, routineNoteService } from "./routine-note-service";
import { Day } from "@shared/day";
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