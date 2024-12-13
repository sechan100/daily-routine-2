import { RoutineNoteDto } from "@entities/note";
import { createStoreContext } from "@shared/zustand/create-store-context";
import { Day } from "@shared/period/day";
import { resolveRoutineNote } from "./resolve-note";


interface UseRoutineNote {
  note: RoutineNoteDto;
  setNote(note: RoutineNoteDto): void;
  setNote(day: Day): void;
}

export const [UseRoutineNoteProvider, useRoutineNote] = 
createStoreContext<RoutineNoteDto, UseRoutineNote>((routineNote, set, get) => ({
  note: routineNote,

  async setNote(noteOrDay: RoutineNoteDto | Day){
    let note: RoutineNoteDto;
    if(noteOrDay instanceof Day){
      note = await resolveRoutineNote(noteOrDay);
    } else {
      note = noteOrDay;
    }
    set({ note });
  },


}));