import { RoutineNote } from "@entities/note";
import { useRoutineNote } from "@features/note";
import { Notice } from "obsidian";
import { t } from "@shared/i18n";
import { useCallback } from "react";
import { NoteView, requestNotesMerge } from "./merge-queue";



/**
 * routine에 적용된 변경사항을 반영하여 note들을 병합한다.
 * 과거노트: note를 기반으로 업데이트하고 저장한다. undefined이라면 과거노트에 대해서는 아무동작도 하지 않는다.
 * 오늘노트, 미래노트: note를 기반으로 업데이트하고 저장한다. undefined이라면 merge된 note를 기반으로 업데이트하고 저장한다.
 *
 * 호출시에 routine들에 대한 변경사항이 아직 반영중인 상태에서 호출하지 않도록 주의한다.(await로 순서보장에 주의)
 * 병합은 모듈 단위의 큐에서 하나씩 실행되므로, 반환된 Promise는 앞선 병합이 끝난 뒤 이 병합까지 끝나야 resolve된다.
 */
// 모든 노트를 병합했으면 true, 하나라도 실패했으면 false(실패는 Notice로 이미 알린 상태).
type MergeNotes = (note?: RoutineNote) => Promise<boolean>;


type UseRoutineMutationMerge = () => {
  mergeNotes: MergeNotes;
}

/**
 * routine 영역에서의 변화는 현재의 note뿐만 아니라 오늘, 그리고 미래의 노트들에게 영향을 준다.
 * 이 훅은 이러한 복잡한 변경사항 적용을 캡슐화한다.
 */
export const useRoutineMutationMerge: UseRoutineMutationMerge = () => {
  const currentDay = useRoutineNote(s => s.note.day.format());
  const setNote = useRoutineNote(s => s.setNote);


  /**
   * @param manuallyMergedCurrentNote 현재 보고있는 노트에 대한 변경사항을 직접 제공한다.
   * 이 경우 currentNote는 merge되지 않고 제공된 데이터로 업데이트된다.
   * 또한 수동으로 제공된 currentNote는 file로 실제 존재하지 않아도 괜찮다.
   *
   */
  const mergeMutationToNotes = useCallback(async (manuallyMergedCurrentNote?: RoutineNote) => {
    if(manuallyMergedCurrentNote && manuallyMergedCurrentNote.day.format() !== currentDay){
      console.error("manuallyMergedCurrentNote must be same day with currentNote.");
      new Notice(t("tasks.merge.applyFailed"));
      return false;
    }
    const view: NoteView = {
      // 병합은 큐에서 나중에 실행될 수 있으므로, 결과를 반영하는 시점의 노트를 읽는다.
      getNote: () => useRoutineNote.getState().note,
      setNote,
    };
    return await requestNotesMerge(view, manuallyMergedCurrentNote);
  }, [currentDay, setNote]);


  return {
    mergeNotes: mergeMutationToNotes,
  }


}
