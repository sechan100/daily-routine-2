import { RoutineNote } from "@entities/note";
import { formatFullDate, t } from "@shared/i18n";
import { createStoreContext } from "@shared/zustand/create-store-context";
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import { resolveRoutineNote } from "./resolve-note";


export interface UseRoutineNote {
  note: RoutineNote;
  setNote(this: void, note: RoutineNote): void;
  setNote(this: void, day: Day): void;
}

/**
 * 사용자가 다른 날짜를 누르면 그 날짜의 노트를 읽는 동안(setNote(day)), 이전 날짜에 대한 늦은 갱신이 도착할 수 있다
 * (병합 결과, 파일 동기화, 끝난 체크 등). 이것이 날짜 이동을 취소하면 화면이 이전 날짜에 머무르므로, 읽고 있는 날짜와 다른 노트는 무시한다.
 * 같은 날짜의 노트는 읽는 중인 결과보다 최신이므로 그대로 반영하고 읽기를 취소한다.
 */
export const initRoutineNoteStore = (routineNote: RoutineNote, set: (state: Partial<UseRoutineNote>) => void): UseRoutineNote => {
  // 마지막으로 요청한 날짜 읽기. 늦게 끝난 이전 읽기가 최신 상태를 덮어쓰지 않도록 id로 구분한다.
  let pendingLoad: { id: number; day: Day } | null = null;
  let lastLoadId = 0;

  return {
    note: routineNote,

    setNote(noteOrDay: RoutineNote | Day){
      if(noteOrDay instanceof Day){
        const load = { id: ++lastLoadId, day: noteOrDay };
        pendingLoad = load;
        resolveRoutineNote(noteOrDay)
          .then((note) => {
            if(pendingLoad?.id !== load.id) return;
            pendingLoad = null;
            set({ note });
          })
          .catch((e: unknown) => {
            console.error(`[Daily Routine] Failed to load the routine note '${noteOrDay.format()}'.`, e);
            // 이미 다른 날로 이동했다면 지난 요청의 실패는 알리지 않는다.
            if(pendingLoad?.id !== load.id) return;
            pendingLoad = null;
            new Notice(t("shell.note.loadDayFailed", { date: formatFullDate(noteOrDay) }));
          });
      } else {
        if(pendingLoad){
          if(!pendingLoad.day.isSameDay(noteOrDay.day)) return;
          pendingLoad = null;
        }
        set({ note: noteOrDay });
      }
    },


  };
}

export const [UseRoutineNoteProvider, useRoutineNote] =
createStoreContext<RoutineNote, UseRoutineNote>(initRoutineNoteStore);
