import { routineNoteArchiver } from "entities/archive";
import { RoutineNote } from "entities/routine-note";
import { createStoreContext } from "libs/create-store-context";
import { Day } from "libs/day";


interface UseRoutineNote {
  routineNote: RoutineNote;
  setRoutineNote: (day: Day) => Promise<void>;
}


export const {useStoreHook: useRoutineNote, context: UseRoutineNoteContext} = createStoreContext<RoutineNote, UseRoutineNote>((data, set) => ({
  routineNote: data,
  setRoutineNote: async (day: Day) => {
    const routineNote = await routineNoteArchiver.getRoutineNote(day);
    set({routineNote});
  },
}));