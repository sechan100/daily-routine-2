/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFrontMatterInfo, Notice, parseYaml, stringifyYaml } from "obsidian";
import { Day, DayOfWeek } from "@shared/day";
import { keys } from "lodash";
import { DEFAULT_ROUTINE, RoutineProperties } from "./routine";


interface RoutineFrontMatterParser {
  // frontmatter: frontmatter를 해석한 js object
  parse(frontmatter: any): RoutineProperties;
  deserialize(fileContent: string): RoutineProperties;
  serialize(properties: RoutineProperties): string;
}

export const routineFrontMatterParser: RoutineFrontMatterParser = {

  parse(frontmatter: any): RoutineProperties {
    const fm = (() => {
      if(typeof frontmatter !== 'object'){
        throw new Error('Routine frontmatter is not object.');
      }
      return frontmatter;
    })()

    // 기본값 정의
    const properties: RoutineProperties = DEFAULT_ROUTINE().properties;

    // order
    if('order' in fm){
      if(
        typeof fm.order === 'number'
      ){
        properties.order = fm.order;
      } 
      else throw getRoutinePropertiesError('order', fm.order);
    }

    // showOnCalendar
    if('showOnCalendar' in fm){
      if(
        typeof fm.showOnCalendar === 'boolean'
      ){
        properties.showOnCalendar = fm.showOnCalendar;
      } 
      else throw getRoutinePropertiesError('showOnCalendar', fm.showOnCalendar);
    }

    // activeCriteria
    if('activeCriteria' in fm){
      if(
        fm.activeCriteria === "week" || fm.activeCriteria === "month"
      ){
        properties.activeCriteria = fm.activeCriteria;
      } 
      else throw getRoutinePropertiesError('activeCriteria', fm.activeCriteria);
    }

    // daysOfWeek
    if('daysOfWeek' in fm){
      if(
        Array.isArray(fm.daysOfWeek) &&
        fm.daysOfWeek.every((d: any) => typeof d === 'string' && keys(DayOfWeek).includes(d))
      ){
        properties.daysOfWeek = fm.daysOfWeek;
      } 
      else throw getRoutinePropertiesError('daysOfWeek', fm.daysOfWeek);
    }

    // daysOfMonth
    if('daysOfMonth' in fm){
      if(
        Array.isArray(fm.daysOfMonth) &&
        fm.daysOfMonth.every((d: any) => typeof d === 'number' && 0 <= d  && d <= 31)
      ){
        properties.daysOfMonth = fm.daysOfMonth;
      } 
      else throw getRoutinePropertiesError('daysOfMonth', fm.daysOfMonth);
    }

    return properties;
  },

  deserialize: (fileContent: string): RoutineProperties => {
    const fmInfo = getFrontMatterInfo(fileContent);
    if(!fmInfo.exists){
      throw new Error('Routine frontmatter is not found.');
    }
    const yaml = fmInfo.frontmatter.replace('---', '').trim()
    const fm = parseYaml(yaml);
    return routineFrontMatterParser.parse(fm);
  },

  serialize: (properties: RoutineProperties): string => {
    const frontmatter = [
      "---",
      stringifyYaml(properties),
      "---"
    ].join('\n');
    return frontmatter;
  }
}


const getRoutinePropertiesError = (propertyName: string, value: any): Error => {
  return new Error(`Routine properties error: ${propertyName} is '${value}'`);
}