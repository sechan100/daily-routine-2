import { noteRepository, RoutineNote } from "@entities/note";
import { groupRepository, isRoutine, isRoutineGroup, RoutineElement, routineRepository } from "@entities/routine";
import { useRoutineMutationMerge } from "@features/merge-note";
import { useRoutineNote } from "@features/note";
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import { t } from "@shared/i18n";
import { useCallback } from "react";
import { ElementDrop, ElementReorder, RoutineElementLookup } from "../model/reorder-elements";


/**
 * 드롭을 현재 노트에 반영하고 저장한다. 반영한 노트를 반환하고, 바뀐 것이 없거나 실패하면 null을 반환한다.
 *
 * - 오늘·미래 노트: 바뀐 순서·group을 routine 파일에도 반영한 뒤, 다른 노트들에 병합한다.
 * - 과거 노트: 그 노트 파일만 바꾼다. (routine은 지금의 배치를 따르므로, 지난 기록의 배치로 되돌리지 않는다)
 */
export const useReorderDrop = () => {
  const { mergeNotes } = useRoutineMutationMerge();

  return useCallback(async (drop: ElementDrop): Promise<RoutineNote | null> => {
    const { note, setNote } = useRoutineNote.getState();
    const moved = ElementReorder.move(note, drop);
    if(moved.isErr()){
      // 드래그 도중 노트가 바뀌어(에디터에서 직접 수정 등) 대상이 사라진 경우. 화면은 이미 최신 노트를 보여주고 있다.
      console.warn(`[Daily Routine] Ignored a drop: ${moved.error}`);
      return null;
    }
    const { note: newNote, parent } = moved.value;
    if(JSON.stringify(newNote.children) === JSON.stringify(note.children)) return null;

    // 파일 쓰기가 끝날 때까지 옮긴 요소가 제자리로 돌아가 보이지 않도록 먼저 화면에 반영한다.
    setNote(newNote);
    try {
      const today = Day.today();
      if(ElementReorder.isPastDay(newNote.day, today)){
        // 드래그하는 동안 파일이 바뀌었을 수 있으므로, 파일의 최신 내용에 같은 이동을 다시 적용한다.
        const outcome = { applied: false };
        const fresh = await noteRepository.updateWith(newNote.day, (current) => {
          const reapplied = ElementReorder.move(current, drop);
          outcome.applied = reapplied.isOk();
          return reapplied.isOk() ? reapplied.value.note : current;
        });
        // 파일이 없으면 쓸 곳이 없으므로 화면의 note를 그대로 둔다.
        if(!fresh) return newNote;
        if(!outcome.applied){
          // 최신 내용에서는 이동할 수 없다. 화면의 낡은 순서를 버리고 파일을 다시 읽는다.
          console.warn("[Daily Routine] Ignored a drop: the note changed while dragging.");
          setNote(newNote.day);
          return null;
        }
        setNote(fresh);
        return fresh;
      } else {
        const lookup = await loadRoutineElementLookup();
        const changes = ElementReorder.resolveRoutineChanges({ day: newNote.day, today, parent, lookup });
        await saveRoutineElements(changes);
        await mergeNotes(newNote);
      }
      return newNote;
    } catch(e) {
      console.error("Failed to persist reordered elements.", e);
      new Notice(t("tasks.dnd.saveOrderFailed"));
      // 화면이 파일의 상태와 어긋나지 않도록 note를 다시 로드한다.
      setNote(note.day);
      return null;
    }
  }, [mergeNotes]);
}


const loadRoutineElementLookup = async (): Promise<RoutineElementLookup> => {
  const routines = new Map<string, RoutineElement>((await routineRepository.loadAll()).map(r => [r.name, r]));
  const groups = new Map<string, RoutineElement>((await groupRepository.loadAll()).map(g => [g.name, g]));
  return (name, type) => (type === "routine" ? routines.get(name) : groups.get(name)) ?? null;
}

const saveRoutineElements = async (elements: RoutineElement[]) => {
  for(const el of elements){
    if(isRoutine(el)){
      await routineRepository.update(el);
    } else if(isRoutineGroup(el)){
      await groupRepository.update(el);
    }
  }
}
