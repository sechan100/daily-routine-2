import { RoutineNoteDto } from "@entities/note";
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { Routine, RoutineDto } from "@entities/routine";



export const saveRoutine = async (noteDto: RoutineNoteDto, dto: RoutineDto): Promise<RoutineNoteDto> => {
  const routine = Routine.fromJSON(dto);
  executeRoutineNotesSynchronize();
  return noteDto;
}