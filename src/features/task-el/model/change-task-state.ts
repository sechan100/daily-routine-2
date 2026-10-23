import { NoteEntity, noteRepository, RoutineNote, TaskState } from "@entities/note";


/**
 * task의 상태를 바꾸고 저장한 노트를 반환한다.
 * 노트 파일이 없어 사용자에게 생성을 물었는데 거절했다면, 아무것도 바꾸지 않은 원래 노트를 반환한다.
 */
export const changeTaskState = async (note: RoutineNote, taskName: string, state: TaskState): Promise<RoutineNote> => {
  const setState = (target: RoutineNote): RoutineNote => {
    const task = NoteEntity.findTask(target, taskName);
    return task ? NoteEntity.replaceTask(target, taskName, { ...task, state }) : target;
  };

  // 파일이 있으면 파일의 최신 내용에 바로 적용한다. 화면의 노트가 오래됐어도(에디터에서 직접 수정 등) 그 변경을 덮어쓰지 않는다.
  const updated = await noteRepository.updateWith(note.day, setState);
  if(updated) return updated;

  if(!NoteEntity.findTask(note, taskName)) throw new Error("Check state change target task not found");
  const changed = setState(note);
  const saved = await noteRepository.saveOnUserConfirm(changed);
  return saved ? changed : note;
}
