import { validateObsidianFileTitle } from "@shared/utils/validate-obsidian-file-title";
import { Err, err, ok, Result } from "neverthrow";
import { RoutineGroupProperties } from "./routine-type";


const UNGROUPED_NAME = "UNGROUPED";

const validateName = (name0: string, groupNames: string[]): Result<string, string> => {
  return validateObsidianFileTitle(name0)
  .andThen(name1 => {
    const invalidNames = [UNGROUPED_NAME];
    return invalidNames.includes(name1) ? err('invalid-name') : ok(name1);
  })
  .andThen(name2 => {
    return groupNames.includes(name2) ? err('duplicated') : ok(name2);
  });
}

/**
 * @param frontmatter frontmatter를 해석한 js object
 */
const validateGroupProperties = (p: unknown): Result<RoutineGroupProperties, string> => {
  if(typeof p !== 'object'){
    return err('RoutineGroupProperties validation target is not object.');
  }
  const props = p as Record<string, unknown>;
  const propsErr = (propertyName: string, value: unknown, msg?: string): Err<RoutineGroupProperties, string> => {
    return err(`[Invalid RoutineGroupProperties]: ${msg??"invalid format"}(${propertyName}: ${String(value)})`);
  }

  if(
    'order' in props &&
    typeof props.order === 'number'
  ){
    if(props.order < 0) return propsErr('order', props.order, "Order must be a non-negative integer.");
  } else return propsErr('order', props.order);

  return ok(p as RoutineGroupProperties);
}



export const RoutineGroupEntity = {
  UNGROUPED_NAME,
  validateName,
  validateGroupProperties
}