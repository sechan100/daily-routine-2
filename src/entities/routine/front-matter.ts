/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFrontMatterInfo, parseYaml, stringifyYaml, TFile } from "obsidian";
import { DayOfWeek } from "shared/day";
import { Routine, RoutineProperties } from "./routine";
import { keys } from "lodash";



export class RoutineFrontMatter {
  #properties: RoutineProperties;

  constructor(properties: RoutineProperties){
    this.#properties = properties;
  }

  /**
   * file을 읽어서 반환된 content 문자열로부터 RoutineFrontMatter 객체를 생성한다.
   */
  static fromContent(content: string){
    const fmInfo = getFrontMatterInfo(content);
    if(!fmInfo.exists){
      throw new Error('Routine frontmatter is not found.');
    }
    const yaml = fmInfo.frontmatter.replace('---', '').trim()
    const fm = parseYaml(yaml);
    
    const properties = {
      order: fm.order,
      daysOfWeek: fm.daysOfWeek
    }

    return new RoutineFrontMatter(properties);
  }

  /**
   * properties로부터 RoutineFrontMatter 객체를 생성한다.
   */
  static fromObsidianFrontMatter(frontmatter: unknown){
    if(!isRoutineProperty(frontmatter)){
      throw new Error('Invalid Routine frontmatter.');
    }
    return new RoutineFrontMatter(frontmatter);
  }

  /**
   * frontmatter block(---)과 개행문자들로 묶인 frontmatter 문자열을 반환한다. 
   */
  stringify(){
    const props = {
      order: this.#properties.order,
      daysOfWeek: this.#properties.daysOfWeek.map(d => DayOfWeek[d])
    }
    const frontmatter = [
      "---",
      stringifyYaml(props),
      "---"
    ].join('\n');
    return frontmatter;
  }

  /**
   * RoutineFrontMatter 객체로부터 properties를 반환한다.
   */
  get properties(): RoutineProperties {
    return this.#properties;
  }
}


/**
 * obsidian api에서 반환된 js object 형식의 frontmatter가 RoutineProperties 타입인지 확인하는 타입가드
 * @param fm js object로 변환된 frontmatter
 */
export function isRoutineProperty(fm: any): fm is RoutineProperties {
  // order
  const hasOrder = 'order' in fm && typeof fm.order === 'number';

  // daysOfWeek
  const hasDaysOfWeek = 
    'daysOfWeek' in fm && 
    Array.isArray(fm.daysOfWeek) &&
    fm.daysOfWeek.every((d: any) => typeof d === 'string' && keys(DayOfWeek).includes(d));

  return hasOrder && hasDaysOfWeek;
}