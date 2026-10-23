import { RoutineGroupEntity } from '@entities/routine';
import { INVALID_TITLE_CHARS_TEXT } from '@shared/utils/validate-obsidian-file-title';
import { t } from '@shared/i18n';
import { err, ok, Result } from 'neverthrow';


/**
 * 그룹 이름을 검증하고, 앞뒤 공백을 제거한 이름을 반환한다.
 * 그룹 생성·이름 변경 모달이 같은 규칙을 쓰도록 한 곳에 둔다.
 */
export const validateGroupName = (name: string, existingNames: string[]): Result<string, string> => {
  return RoutineGroupEntity.validateName(name, existingNames)
  // 노트 직렬화에 쓰이는 예약어이다.
  .andThen(n => n.startsWith(RoutineGroupEntity.UNGROUPED_NAME) ? err('reserved-name') : ok(n))
  // 괄호로 감싸진 이름은 닫힌 그룹 표기와 충돌해 노트 포맷을 깨트린다.
  .andThen(n => /^\(.*\)$/.test(n) ? err('wrapped-in-parentheses') : ok(n));
}

export const groupNameErrorMessage = (error: string, name: string): string => {
  switch(error){
    case "empty": return t("tasks.groupName.empty");
    case "duplicated": return t("tasks.groupName.duplicated", { name });
    case "contains-invalid-characters": return t("tasks.groupName.invalidChars", { chars: INVALID_TITLE_CHARS_TEXT });
    case "starts-or-ends-with-dot": return t("tasks.groupName.dot");
    case "reserved-prefix": return t("tasks.groupName.reservedPrefix");
    // UNGROUPED는 노트 직렬화에 쓰이는 예약어이다.
    case "invalid-name":
    case "reserved-name": return t("tasks.groupName.reservedName", { reserved: RoutineGroupEntity.UNGROUPED_NAME });
    case "wrapped-in-parentheses": return t("tasks.groupName.wrapped");
    default: return t("tasks.groupName.invalid");
  }
}
