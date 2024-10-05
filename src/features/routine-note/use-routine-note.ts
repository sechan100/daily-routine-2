import { RoutineNote, routineNoteArchiver } from "entities/archive";
import { createStoreContext } from "libs/create-store-context";
import { Day } from "libs/day";
import { get } from "lodash";
import { create } from "zustand";


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