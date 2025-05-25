/* eslint-disable fsd-import/layer-imports */
import { NoteRepository, RoutineNote } from "@/entities/note";
import { RoutineNoteCreator } from '@/entities/routine-to-note';
// FIXME: todo task를 구조적으로 분리하면, 해당 hack을 제거할 수 있음. mergeNote에서 TodoTaskNoteDep를 제거하여 구태여 manuallyMergedCurrentNote를 제공하지 않아도 되도록 변경 예정
// eslint-disable-next-line fsd-import/public-api-imports
import { useRoutineNoteStore } from '@/pages/routine-note/model/use-routine-note';
import { Day } from "@/shared/period/day";
import { useCallback } from "react";
import { mergeNote } from "./merge-note";



/**
 * routine에 적용된 변경사항을 반영하여 note들을 병합한다.
 * 과거노트: note를 기반으로 업데이트하고 저장한다. undefined이라면 과거노트에 대해서는 아무동작도 하지 않는다.
 * 오늘노트, 미래노트: note를 기반으로 업데이트하고 저장한다. undefined이라면 merge된 note를 기반으로 업데이트하고 저장한다.
 * 
 * 호출시에 routine들에 대한 변경사항이 아직 반영중인 상태에서 호출하지 않도록 주의한다.(await로 순서보장에 주의)
 */
type MergeNotes = (manuallyMergedCurrentNote?: RoutineNote) => Promise<void>;


type UseRoutineMutationMerge = () => {
  mergeNotes: MergeNotes;
}

/**
 * routine 영역에서의 변화는 현재의 note뿐만 아니라 오늘, 그리고 미래의 노트들에게 영향을 준다.
 * 이 훅은 이러한 복잡한 변경사항 적용을 캡슐화한다.
 */
export const useRoutineMutationMerge: UseRoutineMutationMerge = () => {
  const { note: currentNote, setNote } = useRoutineNoteStore();


  /**
   * @param manuallyProviderTodayNote 현재 보고있는 노트에 대한 변경사항을 직접 제공한다. 
   * 이 경우 currentNote는 merge되지 않고 제공된 데이터로 업데이트된다.
   * 또한 수동으로 제공된 currentNote는 file로 실제 존재하지 않아도 괜찮다.
   * 
   */
  const mergeMutationToNotes = useCallback(async (manuallyMergedCurrentNote?: RoutineNote) => {
    if (manuallyMergedCurrentNote) {
      if (!manuallyMergedCurrentNote.day.isSameDay(currentNote.day)) throw new Error("manuallyMergedCurrentNote must be same day with currentNote.");

      // currentNote 저장
      setNote(manuallyMergedCurrentNote);
      await NoteRepository.updateIfExist(manuallyMergedCurrentNote);

      // currentNote를 제외한 나머지 notes merge
      let notes = await NoteRepository.loadBetween(Day.today(), Day.max());
      notes = notes.filter(n => !n.day.isSameDay(currentNote.day));
      const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();
      for (const note of notes) {
        const merged = mergeNote(note, noteCreator);
        await NoteRepository.update(merged);
      }
    }
    else {
      const notes = await NoteRepository.loadBetween(Day.today(), Day.max());
      const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();
      for (const note of notes) {
        const merged = mergeNote(note, noteCreator);
        if (merged.day.isSameDay(currentNote.day)) {
          setNote(merged);
        }
        await NoteRepository.update(merged);
      }
    }
  }, [currentNote.day, setNote]);


  return {
    mergeNotes: mergeMutationToNotes,
  }


}