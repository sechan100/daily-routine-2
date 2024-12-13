import { NoteRepository, RoutineNote, RoutineNoteDto, TaskDto } from "@entities/note";


export const checkTask = async (noteDto: RoutineNoteDto, taskDto: TaskDto, check: boolean): Promise<RoutineNoteDto> => {
  const note = RoutineNote.fromJSON(noteDto);
  const task = note.findTask(taskDto.name);
  if(!task) throw new Error("Check state change target task not found");
  
  task.check(check);
  const isSaved = await NoteRepository.saveOnUserConfirm(note);
  if(isSaved){
    return note.toJSON();
  } else {
    return { ...noteDto };
  }
}