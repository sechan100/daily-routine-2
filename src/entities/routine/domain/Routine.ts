/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day, DayOfWeek } from "@shared/period/day";
import { validateObsidianFileTitle } from "@shared/utils/validate-obsidian-file-title";
import { keys } from "lodash";
import { err, Err, ok, Result } from "neverthrow";
import { Routine, RoutineProperties } from "./routine.type";


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
    return err('Internal error: Invalid frontmatter format');
  }

  if(
    'order' in p &&
    typeof p.order === 'number'
  ){
    if(p.order < 0) return err("Order must be a non-negative integer.");
  } else {
    return err("property 'order' is missing or not a number.");
  }

  if(
    'group' in p &&
    typeof p.group === 'string'
  ){
    //
  } else {
    return err("property 'group' is missing or not a existing group name.");
  }

  if(
    'showOnCalendar' in p && 
    typeof p.showOnCalendar === 'boolean'
  ){
    //
  } else {
    return err("property 'showOnCalendar' is missing or not a boolean.");
  }

  if(
    'activeCriteria' in p && 
    typeof p.activeCriteria === 'string'
  ){
    if(!["week", "month"].includes(p.activeCriteria)) return err("property 'activeCriteria' must be either 'week' or 'month'");
  } else {
    return err("property 'activeCriteria' is missing or not a string.");
  }

  if(
    'daysOfWeek' in p &&
    Array.isArray(p.daysOfWeek)
  ){
    for(const d of p.daysOfWeek){
      if(!keys(DayOfWeek).includes(d)) return err(`Invalid property 'dayOfWeek': ${d}`);
    }
  } else {
    return err("property 'daysOfWeek' is missing or not an array of dayOfWeek.");
  }

  if(
    'daysOfMonth' in p &&
    Array.isArray(p.daysOfMonth)
  ){
    for(const d of p.daysOfMonth){
      if(typeof d !== 'number') return err(`property 'DayOfMonth' must be a number: ${d}`);
      if(d < 0 || d > 31) return err(`property 'DayOfMonth' must be between 0 and 31: ${d}`);
    }
  } else {
    return err("property 'daysOfMonth' is missing or not an array of number.");
  }

  if(
    'enabled' in p &&
    typeof p.enabled === 'boolean'
  ){
    //
  } else {
    return err("property 'enabled' is missing or not a boolean.");
  }

  return ok(p as RoutineProperties);
}

/**
 * routine의 여러 properties들을 분석하여, day에 루틴을 수행해야하는지의 여부를 반환한다.
 */
const isDueTo = (routine: Routine, day: Day): boolean => {
  const p = routine.properties;

  if(!p.enabled) return false;

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
  validateName,
  validateRoutineProperties,
  isDueTo,
}