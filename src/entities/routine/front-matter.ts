import { getFrontMatterInfo, Notice, parseYaml, stringifyYaml } from "obsidian";
import { DayOfWeek } from "@shared/day";
import { validateRoutineProperties, RoutineProperties } from "./types";



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
    
    const properties: RoutineProperties = {
      order: fm.order,
      activeCriteria: fm.activeCriteria,
      daysOfWeek: fm.daysOfWeek,
      daysOfMonth: fm.daysOfMonth
    }
    if(!validateRoutineProperties(properties)){
      new Notice('Invalid Routine frontmatter.');
      throw new Error('Invalid Routine frontmatter.');
    }

    return new RoutineFrontMatter(properties);
  }

  /**
   * properties로부터 RoutineFrontMatter 객체를 생성한다.
   */
  static fromObsidianFrontMatter(frontmatter: unknown){
    if(!validateRoutineProperties(frontmatter)){
      throw new Error('Invalid Routine frontmatter.');
    }
    return new RoutineFrontMatter(frontmatter);
  }

  /**
   * frontmatter block(---)과 개행문자들로 묶인 frontmatter 문자열을 반환한다. 
   */
  stringify(){
    const frontmatter = [
      "---",
      stringifyYaml(this.#properties),
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