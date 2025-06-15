/* eslint-disable @typescript-eslint/no-explicit-any */
import { DayOfWeek } from "@/shared/period/day";
import dedent from "dedent";
import { keys } from "lodash";
import { err, ok, Result } from "neverthrow";
import { TFile } from "obsidian";
import { Routine, RoutineProperties } from "../types/routine";

/**
 * @param p properties를 해석한 js object
 */
const validateRoutineProperties = (p: any): Result<RoutineProperties, string> => {
  if (typeof p !== 'object') {
    return err('RoutineProperties validation target is not object.');
  }

  if (
    'order' in p &&
    typeof p.order === 'number'
  ) {
    //
  } else {
    return err("property 'order' is missing or not a number.");
  }

  if (
    'showOnCalendar' in p &&
    typeof p.showOnCalendar === 'boolean'
  ) {
    //
  } else {
    return err("property 'showOnCalendar' is missing or not a boolean.");
  }

  if (
    'recurrenceUnit' in p &&
    typeof p.recurrenceUnit === 'string'
  ) {
    if (!["week", "month"].includes(p.recurrenceUnit)) return err("property 'recurrenceUnit' must be either 'week' or 'month'");
  } else {
    return err("property 'recurrenceUnit' is missing or not a string.");
  }

  if (
    'daysOfWeek' in p &&
    Array.isArray(p.daysOfWeek)
  ) {
    for (const d of p.daysOfWeek) {
      if (!keys(DayOfWeek).includes(d)) return err(`Invalid property 'dayOfWeek': ${d}`);
    }
  } else {
    return err("property 'daysOfWeek' is missing or not an array of dayOfWeek.");
  }

  if (
    'daysOfMonth' in p &&
    Array.isArray(p.daysOfMonth)
  ) {
    for (const d of p.daysOfMonth) {
      if (typeof d !== 'number') return err(`property 'DayOfMonth' must be a number: ${d}`);
      if (d < 0 || d > 31) return err(`property 'DayOfMonth' must be between 0 and 31: ${d}`);
    }
  } else {
    return err("property 'daysOfMonth' is missing or not an array of number.");
  }

  if (
    'group' in p &&
    typeof p.group === 'string'
  ) {
    //
  } else {
    return err("property 'group' is missing or not a existing group name.");
  }

  if (
    'enabled' in p &&
    typeof p.enabled === 'boolean'
  ) {
    //
  } else {
    return err("property 'enabled' is missing or not a boolean.");
  }

  return ok(p as RoutineProperties);
}

/**
 * 
 * @param fileContent 이전에 저장된 routine 파일의 내용
 * @param routine 
 * @returns 
 */
export const serializeRoutine = (routine: Routine) => {
  return routine.userContent + dedent`
  %% daily-routine
  \`\`\`
  ${JSON.stringify(routine.properties, null, 0)}
  \`\`\`
  %%`;
}

/**
 * TFile을 받아서 Routine 객체로 변환한다.
 * 
 * 루틴을 저장소에서 읽어와 변환하는 로직은 모두 해당 함수를 사용한다.
 * @param file 
 * @returns 
 */
export const deserializeRoutine = (file: TFile, fileContent: string): Routine => {
  const jsonMatch = fileContent.match(/([\s\S]*?)%% daily-routine\s*\n```\s*([\s\S]*?)\s*```\s*%%/);
  if (!jsonMatch) {
    throw new Error(`[Routine '${file.basename}' Parse Error] Invalid file format.`);
  }
  const userContent = jsonMatch[1]; // trim하지 않음.
  const name = file.basename;
  const properties = validateRoutineProperties(JSON.parse(jsonMatch[2].trim()));
  if (properties.isErr()) throw new Error(`[Routine '${name}' Parse Error] ${properties.error} `);
  return {
    name,
    userContent,
    link: file.path,
    properties: properties.value,
    routineLikeType: "routine"
  }
}