/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day, DayOfWeek } from "@shared/period/day";
import { keys } from "lodash";
import { stringifyYaml } from "obsidian";
import { err, Result, ok, Err } from "neverthrow";
import { parseFrontmatter } from "@shared/file/parse-frontmatter";
import dedent from "dedent";
import { validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { Routine, RoutineProperties } from "./routine.type";
import { RoutineGroupEntity } from "./routine-group";


const DEFAULT_ROUTINE = (): Routine => {
  return {
    name: "New Routine",
    properties: {
      order: 0,
      group: RoutineGroupEntity.UNGROUPED_NAME,
      showOnCalendar: false,
      activeCriteria: "week",
      daysOfWeek: Day.getDaysOfWeek(),
      daysOfMonth: [Day.now().date],
    }
  }
}

type NameValidationArgs = {
  name: string;
  existingNames: string[];
}
const validateName = ({
  name: name0,
  existingNames
}: NameValidationArgs): Result<string, string> => {
  return validateObsidianFileTitle(name0)
  .andThen(name1 => {
    return existingNames.includes(name1) ? err('duplicated') : ok(name1);
  });
}

/**
 * @param frontmatter frontmatter를 해석한 js object
 */
const validateRoutineProperties = (p: any): Result<RoutineProperties, string> => {
  if(typeof p !== 'object'){
    return err('RoutineProperties validation target is not object.');
  }
  const propsErr = (propertyName: string, value: any, msg?: string): Err<RoutineProperties, string> => {
    return err(`[Invalid RoutineProperties]: ${msg??"invalid format"}(${propertyName}: ${value})`);
  }

  if(
    'order' in p &&
    typeof p.order === 'number'
  ){
    if(p.order < 0) return propsErr('order', p.order, "Order must be a non-negative integer.");
  } else {
    return propsErr('order', p.order);
  }

  if(
    'group' in p &&
    typeof p.group === 'string'
  ){
    //
  } else {
    return propsErr('group', p.group);
  }

  if(
    'showOnCalendar' in p && 
    typeof p.showOnCalendar === 'boolean'
  ){
    //
  } else {
    return propsErr('showOnCalendar', p.showOnCalendar);
  }

  if(
    'activeCriteria' in p && 
    typeof p.activeCriteria === 'string'
  ){
    if(!["week", "month"].includes(p.activeCriteria)) return propsErr('activeCriteria', p.activeCriteria);
  } else {
    return propsErr('activeCriteria', p.activeCriteria);
  }

  if(
    'daysOfWeek' in p &&
    Array.isArray(p.daysOfWeek)
  ){
    for(const d of p.daysOfWeek){
      if(typeof d !== 'string') return propsErr('daysOfWeek', p.daysOfWeek, `Invalid day of week: ${d}`);
      if(!keys(DayOfWeek).includes(d)) return propsErr('daysOfWeek', p.daysOfWeek, `Invalid day of week: ${d}`);
    }
  } else {
    return propsErr('daysOfWeek', p.daysOfWeek);
  }

  if(
    'daysOfMonth' in p &&
    Array.isArray(p.daysOfMonth)
  ){
    for(const d of p.daysOfMonth){
      if(typeof d !== 'number') return propsErr('daysOfMonth', p.daysOfMonth, `Invalid day of month: ${d}`);
      if(d < 0 || d > 31) return propsErr('daysOfMonth', p.daysOfMonth, `Range of day of month is 0~31: ${d}`);
    }
  } else {
    return propsErr('daysOfMonth', p.daysOfMonth);
  }

  return ok(p as RoutineProperties);
}

/**
 * NOTE: daysOfWeek와 daysOfMonth를 기준으로 루틴을 수행할지 말지를 결정한다.
 * - daysOfMonth가 0인 경우는 매월의 마지막 날을 의미한다.
 */
const isDueTo = (routine: Routine, day: Day): boolean => {
  const p = routine.properties;

  if(p.activeCriteria === "month"){
    const days = Array.from(p.daysOfMonth);
    // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
    if(days.contains(0)) {
      const lastDayOfMonth = day.daysInMonth();
      days.remove(0);
      days.push(lastDayOfMonth);
    }
    if(!days.contains(day.date)) return false;
  }
  else if(p.activeCriteria === "week") {
    if(!p.daysOfWeek.contains(day.dow)) return false;
  }
  else {
    throw new Error('Invalid activeCriteria');
  }
  return true;
}



export const RoutineEntity = {
  DEFAULT_ROUTINE,
  validateName,
  validateRoutineProperties,
  isDueTo,
}