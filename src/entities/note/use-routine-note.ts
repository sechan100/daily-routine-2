import { createStoreContext } from "shared/zustand/create-store-context";
import { RoutineNote, routineNoteService, Task } from "./routine-note-service";
import { Day } from "shared/day";
import { persisteOrUpdateRoutineNote, routineNoteArchiver } from "./archive";
import { openConfirmModal } from "shared/components/modal/confirm-modal";



// TODO: 변경 로직이 이후 복잡해진다면, 해당 전역 상태를 읽기 전용으로 전환하고 변경 로직은 이벤트를 통해서 처리하도록 변경하는 것을 고려.
interface UseRoutineNote {
  note: RoutineNote;
  isTransient: boolean;

  // isTransient는 그대로 가져간다. (저장하지 않고 상태만 변경)
  setNote(note: RoutineNote): void;
  setNote(day: Day): void;

  // isTransient는 반드시 false가 된다. (저장하고 상태까지 변경)
  setNoteAndSave(note: RoutineNote): void;

  checkTask(task: Task, checked: boolean): void;
}

export const { StoreProvider: UseRoutineNoteProvider, useStoreHook: useRoutineNote } = 
createStoreContext<{
  note: RoutineNote;
  isTransient: boolean;
}, UseRoutineNote>((data, set, get) => ({
  note: data.note,

  isTransient: data.isTransient,

  async setNote(noteOrDay: RoutineNote | Day){
    if(noteOrDay instanceof Day){
      const day = noteOrDay;
      let routineNote = await routineNoteArchiver.load(day);
      let isTransient = false;
      if(!routineNote){
        routineNote = await routineNoteService.create(day);
        isTransient = true;
      }
      set({ note: routineNote, isTransient });
    } else {
      set({ note: noteOrDay });
    }
  },

  async setNoteAndSave(note: RoutineNote){
    // 이미 persistence된 노트인 경우
    if(!get().isTransient){
      set({ note });
      return await persisteOrUpdateRoutineNote(note);
    }
    // transient한 노트인 경우
    openConfirmModal({
      description: `Create note for ${note.day.getBaseFormat()}?`,
      confirmText: "Create",
      onConfirm: async () => {
        await persisteOrUpdateRoutineNote(note);
        set({ note: note, isTransient: false });
      },
      confirmBtnVariant: "accent",
      className: "dr-create-feature-note-confirm-modal"
    })
  },

  checkTask(task, checked){
    const note = get().note;
    const newNote = {
      ...note,
      tasks: note.tasks.map(t => {
        if(t.name === task.name){
          return {
            ...t,
            checked
          }
        } else {
          return t;
        }
      })
    }
    get().setNoteAndSave(newNote);
  }
}));