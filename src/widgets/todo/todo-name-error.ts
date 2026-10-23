import { t } from "@shared/i18n";


/**
 * validateTodoName·editTodoInNote의 오류 코드를 사용자에게 보여줄 문구로 바꾼다.
 */
export const todoNameErrorMessage = (error: string, name: string): string => {
  switch(error){
    case "empty": return t("tasks.todoName.empty");
    case "duplicated": return t("tasks.todoName.duplicated", { name });
    case "contains-comment-marker": return t("tasks.todoName.commentMarker");
    case "contains-link-brackets": return t("tasks.todoName.linkBrackets");
    case "not-found": return t("tasks.todoName.notFound");
    default: return t("tasks.todoName.invalid");
  }
}
