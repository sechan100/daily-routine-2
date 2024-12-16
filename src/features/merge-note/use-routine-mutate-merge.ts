import { mergeNote } from "./merge-note";
import { noteRepository, RoutineNote } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { useRoutineNote } from "@features/note";
import { Day } from "@shared/period/day";
import { useCallback } from "react";



/**
 * routine에 적용된 변경사항을 반영하여 note들을 병합한다.
 * 과거노트: note를 기반으로 업데이트하고 저장한다. undefined이라면 과거노트에 대해서는 아무동작도 하지 않는다.
 * 오늘노트, 미래노트: note를 기반으로 업데이트하고 저장한다. undefined이라면 merge된 note를 기반으로 업데이트하고 저장한다.
 * 
 * 호출시에 routine들에 대한 변경사항이 아직 반영중인 상태에서 호출하지 않도록 주의한다.(await로 순서보장에 주의)
 */
type MergeNote = (note?: RoutineNote) => Promise<void>;


type UseRoutineMutationMerge = () => {
  mergeNote: MergeNote;
}

/**
 * routine 영역에서의 변화는 현재의 note뿐만 아니라 오늘, 그리고 미래의 노트들에게 영향을 준다.
 * 이 훅은 이러한 복잡한 변경사항 적용을 캡슐화한다.
 */
export const useRoutineMutationMerge: UseRoutineMutationMerge = () => {
  const { note: currentNote, setNote } = useRoutineNote();

  const mergeMutationToNote = useCallback(async (manuallyMutatedNote?: RoutineNote) => {
    if(manuallyMutatedNote){
      if(!manuallyMutatedNote.day.isSameDay(currentNote.day)) throw new Error("note day is not same as current note day");
      // note 저장
      setNote(manuallyMutatedNote);
      await noteRepository.updateIfExist(manuallyMutatedNote);
      // merge
      let notes = await noteRepository.loadBetween(Day.now(), Day.max());
      notes = notes.filter(n => !n.day.isSameDay(currentNote.day));
      const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();
      for(const note of notes){
        const merged = mergeNote(note, noteCreator);
        await noteRepository.delete(note.day);
        await noteRepository.persist(merged);
      }
    } else {
      const notes = await noteRepository.loadBetween(Day.now(), Day.max());
      const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();
      for(const note of notes){
        const merged = mergeNote(note, noteCreator);
        if(merged.day.isSameDay(currentNote.day)){
          setNote(merged);
          await noteRepository.updateIfExist(merged);
        }
        await noteRepository.delete(merged.day);
        await noteRepository.persist(merged);
      }
    }
  }, [currentNote.day, setNote]);


  return {
    mergeNote: mergeMutationToNote,
  }


}