// eslint-disable-next-line fsd-import/layer-imports
import { DailyRoutineEventTypes } from "app/event-type";
import { routineNoteArchiver } from "entities/archive";
import { RoutineNote, routineNoteService } from "entities/routine-note";
import { Day } from "shared/day";
import { drEvent } from "shared/event";
import { NoteDepentdent } from "./note-dependents";
import { TodoTaskNoteDep } from "./TodoTaskNoteDep";



export const registerFeatureNoteUpdateEvent = (events: DailyRoutineEventTypes[]) => {
  for(const event of events){
    drEvent.on(event, updateFeatureNotes);
  }

  return () => {
    for(const event of events){
      drEvent.off(event, updateFeatureNotes);
    }
  }
}


const updateFeatureNotes = async () => {
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
    await routineNoteArchiver.save(depsRestoredNote);
  }
}



const extractNoteDependents = (note: RoutineNote): NoteDepentdent[] => {
  return [
    new TodoTaskNoteDep(note),
  ]
}
