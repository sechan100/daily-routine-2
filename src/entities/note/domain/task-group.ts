import { validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";



const validateName = (name0: string, groupNames: string[]): Result<string, string> => {
  return validateObsidianFileTitle(name0)
  .andThen(name1 => {
    return groupNames.includes(name1) ? err('duplicated') : ok(name1);
  })
  .andThen(name2 => {
    return name2 === 'UNGROUPED' ? err('reserved-name') : ok(name2);
  })
}

export const TaskGroupEntity = {
  validateName
}