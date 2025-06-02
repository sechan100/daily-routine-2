/* eslint-disable @typescript-eslint/no-explicit-any */
import { fileAccessor } from "@/shared/file/file-accessor";
import dedent from "dedent";
import { err, Err, ok, Result } from "neverthrow";
import { TFile } from "obsidian";
import { RoutineGroup, RoutineGroupProperties } from "../model/routine-group";


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
    if (p.order < 0) return propsErr('order', p.order, "Order must be a non-negative integer.");
  } else return propsErr('order', p.order);

  return ok(p as RoutineGroupProperties);
}

/**
 * 
 * @param fileContent 이전에 저장된 routine group 파일 내용
 * @param group 
 * @returns 
 */
export const serializeRoutineGroup = (fileContent: string, group: RoutineGroup) => {
  // %% daily-routine 이전 부분을 모두 가져옴.
  const userContent = fileContent.split(/%% daily-routine\s*\n```(?:json)?\s*[\s\S]*?\s*```\s*%%/)[0];
  return userContent + dedent`
  %% daily-routine
  \`\`\`
  ${JSON.stringify(group.properties, null, 0)}
  \`\`\`
  %%`;
}

export const deserializeRoutineGroup = async (file: TFile): Promise<RoutineGroup> => {
  const fileContent = await fileAccessor.readFileFromDisk(file);
  // 저 위의 구조에서 JSON 부분만 추출
  const jsonMatch = fileContent.match(/%% daily-routine\s*\n```(?:json)?\s*([\s\S]*?)\s*```\s*%%/);
  if (!jsonMatch) {
    throw new Error(`[RoutineGroup '${file.basename}' Parse Error] Invalid file format.`);
  }
  const name = file.basename;
  const properties = validateRoutineGroupProperties(JSON.parse(jsonMatch[1].trim()));
  if (properties.isErr()) throw new Error(`[RoutineGroup '${name}' Parse Error] ${properties.error} `);
  return {
    name,
    properties: properties.value,
    routineLikeType: "routine-group"
  }
}