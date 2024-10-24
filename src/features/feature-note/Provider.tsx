// eslint-disable-next-line fsd-import/layer-imports
import { DailyRoutineEventTypes } from 'shared/event';
// eslint-disable-next-line fsd-import/public-api-imports
import { persisteOrUpdateRoutineNote } from "entities/note/archive";
import { useCallback, useEffect } from "react"
import { drEvent } from "shared/event";
import { RoutineNote, routineNoteArchiver, routineNoteService, useRoutineNote } from "entities/note";
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
    const notes = await routineNoteArchiver.loadBetween(Day.now(), Day.max());
    
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
      persisteOrUpdateRoutineNote(depsRestoredNote);
    }
  }, [])


  useEffect(() => {
    const events: DailyRoutineEventTypes[] = [
      "createRoutine",
      "deleteRoutine",
      "reorderTasks",
      "updateRoutineProperties",
    ];
    for(const event of events){
      drEvent.on(event, updateFeatureNotes);
    }
  
    return () => {
      for(const event of events){
        drEvent.off(event, updateFeatureNotes);
      }
    }
  }, [updateFeatureNotes])

  return (
    <div className={props.className}>
      {props.children}
    </div>
  )
}