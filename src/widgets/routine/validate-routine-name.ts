import { NoteEntity, RoutineNote } from "@entities/note";
import { RoutineEntity, TagError } from "@entities/routine";
import { t } from "@shared/i18n";
import { INVALID_TITLE_CHARS_TEXT } from "@shared/utils/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";


/**
 * 루틴 이름을 검증하고, 앞뒤 공백을 제거한 이름을 반환한다.
 * 노트 안의 task는 이름으로 식별되므로, 지금 보고 있는 노트의 todo와 같은 이름도 쓸 수 없다.
 */
export const validateRoutineName = (name: string, existingRoutineNames: string[], note: RoutineNote): Result<string, string> => {
  const todoNames = NoteEntity.flatten(note).filter(task => task.taskType === "todo").map(task => task.name);
  return RoutineEntity.validateName({ name, existingNames: existingRoutineNames })
  .andThen(n => todoNames.includes(n) ? err("duplicated-todo") : ok(n));
}

export const routineNameErrorMessage = (error: string, name: string): string => {
  switch(error){
    case "empty": return t("tasks.routineName.empty");
    case "duplicated": return t("tasks.routineName.duplicated", { name });
    case "duplicated-todo": return t("tasks.routineName.duplicatedTodo", { name });
    case "contains-invalid-characters": return t("tasks.routineName.invalidChars", { chars: INVALID_TITLE_CHARS_TEXT });
    case "starts-or-ends-with-dot": return t("tasks.routineName.dot");
    case "reserved-prefix": return t("tasks.routineName.reservedPrefix");
    default: return t("tasks.routineName.invalid");
  }
}

/**
 * RoutineEntity.validateTags의 오류를 사용자에게 보여줄 문구로 바꾼다.
 */
export const routineTagsErrorMessage = (error: TagError): string => {
  switch(error.code){
    case "empty": return t("tasks.tags.empty");
    case "reserved-char": return t("tasks.tags.percent");
    default: return t("tasks.tags.invalid");
  }
}
