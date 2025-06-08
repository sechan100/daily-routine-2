/* eslint-disable @typescript-eslint/no-explicit-any */
import dedent from "dedent";
import { err, Err, ok, Result } from "neverthrow";
import { TFile } from "obsidian";
import { RoutineGroup, RoutineGroupProperties } from "./routine-group";


/**
 * @param p properties를 해석한 js object
 */
const validateRoutineGroupProperties = (p: any): Result<RoutineGroupProperties, string> => {
  if (typeof p !== 'object') {
    return err('RoutineGroupProperties validation target is not object.');
  }
  const propsErr = (propertyName: string, value: any, msg?: string): Err<RoutineGroupProperties, string> => {
    return err(`[Invalid RoutineGroupProperties]: ${msg ?? "invalid format"}(${propertyName}: ${value})`);
  }

  if (
    'order' in p &&
    typeof p.order === 'number'
  ) {
    //
  } else return propsErr('order', p.order);

  return ok(p as RoutineGroupProperties);
}

/**
 * 
 * @param fileContent 이전에 저장된 routine group 파일 내용
 * @param group 
 * @returns 
 */
export const serializeRoutineGroup = (group: RoutineGroup) => {
  return group.userContent + dedent`
  %% daily-routine
  \`\`\`
  ${JSON.stringify(group.properties, null, 0)}
  \`\`\`
  %%`;
}

export const deserializeRoutineGroup = (file: TFile, fileContent: string): RoutineGroup => {
  const jsonMatch = fileContent.match(/([\s\S]*?)%% daily-routine\s*\n```\s*([\s\S]*?)\s*```\s*%%/);
  if (!jsonMatch) {
    throw new Error(`[RoutineGroup '${file.basename}' Parse Error] Invalid file format.`);
  }
  const userContent = jsonMatch[1]; // trim하지 않음.
  const name = file.basename;
  const properties = validateRoutineGroupProperties(JSON.parse(jsonMatch[2].trim()));
  if (properties.isErr()) throw new Error(`[RoutineGroup '${name}' Parse Error] ${properties.error} `);
  return {
    name,
    userContent,
    properties: properties.value,
    routineLikeType: "routine-group"
  }
}