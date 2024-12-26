/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateObsidianFileTitle } from "@shared/utils/validate-obsidian-file-title";
import { Err, err, ok, Result } from "neverthrow";
import { RoutineGroupProperties } from "./routine.type";


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
const validateGroupProperties = (p: any): Result<RoutineGroupProperties, string> => {
  if(typeof p !== 'object'){
    return err('RoutineGroupProperties validation target is not object.');
  }
  const propsErr = (propertyName: string, value: any, msg?: string): Err<RoutineGroupProperties, string> => {
    return err(`[Invalid RoutineGroupProperties]: ${msg??"invalid format"}(${propertyName}: ${value})`);
  }

  if(
    'order' in p &&
    typeof p.order === 'number'
  ){
    if(p.order < 0) return propsErr('order', p.order, "Order must be a non-negative integer.");
  } else return propsErr('order', p.order);

  return ok(p as RoutineGroupProperties);
}



export const RoutineGroupEntity = {
  UNGROUPED_NAME,
  validateName,
  validateGroupProperties
}