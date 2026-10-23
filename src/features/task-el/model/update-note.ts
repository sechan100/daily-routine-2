import { noteRepository, RoutineNote } from "@entities/note";
import { err, ok, Result } from "neverthrow";


/**
 * note에 mutate를 적용해 저장하고, 저장한 노트를 반환한다.
 *
 * 노트 파일이 있으면 파일의 최신 내용에 mutate를 적용한다. 화면의 note는 확인창을 기다리는 동안 등으로 오래됐을 수 있고,
 * 그 note를 통째로 쓰면 그 사이 파일에 생긴 변경(병합, 동기화, 에디터에서의 직접 수정)을 덮어쓰기 때문이다.
 * 파일이 없으면 화면의 note에 적용해 새로 만든다.
 *
 * mutate는 동기 함수이고 전달받은 노트를 바꾸지 않아야 한다. 바꿀 것이 없으면 전달받은 노트를 그대로 반환한다.
 */
export const updateNote = async (note: RoutineNote, mutate: (current: RoutineNote) => RoutineNote): Promise<RoutineNote> => {
  const updated = await noteRepository.updateWith(note.day, mutate);
  if(updated) return updated;

  const changed = mutate(note);
  if(changed === note) return note;
  if(await noteRepository.persist(changed)) return changed;

  // 그 사이 파일이 생겼다면 persist는 아무것도 쓰지 않으므로, 생긴 파일의 최신 내용에 다시 적용한다.
  const retried = await noteRepository.updateWith(note.day, mutate);
  if(!retried) throw new Error(`Failed to update the note of ${note.day.format()}.`);
  return retried;
}

/**
 * updateNote와 같되, mutate가 err를 반환하면(파일의 최신 내용에서는 변경할 수 없는 경우) 아무것도 쓰지 않고 그 err를 반환한다.
 */
export const updateNoteChecked = async <E>(note: RoutineNote, mutate: (current: RoutineNote) => Result<RoutineNote, E>): Promise<Result<RoutineNote, E>> => {
  // updateNote의 mutate는 값을 돌려줘야 하므로, 실패 이유는 바깥에 담아 둔다.
  const failure: { error: E | undefined } = { error: undefined };
  const updated = await updateNote(note, (current) => {
    const result = mutate(current);
    if(result.isErr()){
      failure.error = result.error;
      return current;
    }
    return result.value;
  });
  return failure.error !== undefined ? err(failure.error) : ok(updated);
}
