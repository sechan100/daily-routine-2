// eslint-disable-next-line fsd-import/layer-imports
import { DailyRoutineEventTypes } from 'shared/event';
import { useCallback, useEffect } from "react"
import { drEvent } from "shared/event";
import { RoutineNote, routineNoteArchiver, routineNoteService, Task, useRoutineNote } from "entities/note";
import { TodoTaskNoteDep } from "./TodoTaskNoteDep";
import { Day } from "shared/day";
import { NoteDepentdent } from "./note-dependents";
import { TaskCheckedStateNoteDep } from './TaskCheckedStateNoteDep';




/**
 * note로부터 NoteDepentdent를 추출한다.
 * 구체적인 추출 로직은 각 클래스의 생성자에서 담당한다.
 */
const extractNoteDependents = (note: RoutineNote): NoteDepentdent[] => {
  return [
    new TodoTaskNoteDep(note),
    new TaskCheckedStateNoteDep(note),
  ]
}

interface FeatureNoteUpdateProviderProps {
  children: React.ReactNode,
  className?: string,
}
export const FeatureNoteUpdateProvider = (props: FeatureNoteUpdateProviderProps) => {
  
  const updateFeatureNotes = useCallback(async () => {
    const notes = await routineNoteArchiver.loadBetween(Day.now().add(1, "day"), Day.max());
    
    const newNotesWithDep = await Promise.all(notes.map(async note => {
      const dependents = extractNoteDependents(note);
      await routineNoteArchiver.delete(note.day);
      const newNote = await routineNoteService.create(note.day);
      return { newNote, dependents }
    }));
  
    for(const { dependents, newNote } of newNotesWithDep){
      const depsRestoredNote = dependents.reduce((note, dep) => {
        return dep.restoreData(note);
      }, newNote);
      routineNoteArchiver.persist(depsRestoredNote);
    }
  }, [])



  // FIXME: 이벤트가 많아지고 각 이벤트가 가지는 고유의 로직이 달라질 경우, 이벤트를 등록과 cleanup 함수를 반환하는 로직에서 실수가 나오기에 충분한 여지가 생김
  useEffect(() => {
    drEvent.on("createRoutine", updateFeatureNotes);
    drEvent.on("deleteRoutine", updateFeatureNotes);
    drEvent.on("updateRoutineProperties", updateFeatureNotes);
    drEvent.on("reorderRoutine", updateFeatureNotes);
  
    return () => {
      drEvent.off("createRoutine", updateFeatureNotes);
      drEvent.off("deleteRoutine", updateFeatureNotes);
      drEvent.off("updateRoutineProperties", updateFeatureNotes);
      drEvent.off("reorderRoutine", updateFeatureNotes);
    }
  }, [updateFeatureNotes])

  return (
    <div className={props.className}>
      {props.children}
    </div>
  )
}