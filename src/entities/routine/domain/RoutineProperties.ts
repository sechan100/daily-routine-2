/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day, DayOfWeek } from "@shared/period/day";
import { keys } from "lodash";
import { stringifyYaml } from "obsidian";
import { RoutinePropertiesDto } from "../types";
import { err, Result, ok } from "neverthrow";
import { JsonConvertible } from "@shared/JsonConvertible";
import { RoutineGroup } from "./RoutineGroup";



const getRoutinePropertiesError = (propertyName: string, value: any): Error => {
  return new Error(`Routine frontmatter parse fail: ${propertyName} is '${value}'`);
}


export class RoutineProperties implements JsonConvertible<RoutinePropertiesDto> {
  private order: number; // routine들 순서(음이 아닌 정수 0, 1, 2, ...)
  private group: string; // 루틴 그룹 이름
  private showOnCalendar: boolean; // 캘린더에 표시할지 여부
  private activeCriteria: "week" | "month"; // 루틴이 활성화되는 기준
  private daysOfWeek: DayOfWeek[]; // 요일
  private daysOfMonth: number[]; // 0 ~ 31 (0은 매월 마지막 날)

  constructor(properties?: RoutinePropertiesDto) {
    const p = properties ?? {
      order: 0,
      group: RoutineGroup.UNGROUPED_NAME,
      showOnCalendar: false,
      activeCriteria: "week",
      daysOfWeek: Day.getDaysOfWeek(),
      daysOfMonth: [Day.now().date],
    }
    this.order = p.order;
    this.group = p.group;
    this.showOnCalendar = p.showOnCalendar;
    this.activeCriteria = p.activeCriteria;
    this.daysOfWeek = p.daysOfWeek;
    this.daysOfMonth = p.daysOfMonth;
  }

  /**
   * @param frontmatter frontmatter를 해석한 js object
   */
  static fromObject(obj: any): RoutineProperties {
    if(typeof obj !== 'object'){
      throw new Error('Routine frontmatter is not object.');
    }
    const fm = new RoutineProperties();

    if(
      'order' in obj &&
      typeof obj.order === 'number'
    ){
      fm.setOrder(obj.order);
    } else throw getRoutinePropertiesError('order', obj.order);

    if(
      'group' in obj &&
      typeof obj.group === 'string'
    ){
      fm.setGroup(obj.group);
    } else throw getRoutinePropertiesError('group', obj.group);

    if(
      'showOnCalendar' in obj && 
      typeof obj.showOnCalendar === 'boolean'
    ){
      fm.setShowOnCalendar(obj.showOnCalendar);
    } else throw getRoutinePropertiesError('showOnCalendar', obj.showOnCalendar);

    if(
      'activeCriteria' in obj && 
      (obj.activeCriteria === "week" || obj.activeCriteria === "month")
    ){
      fm.setActiveCriteria(obj.activeCriteria);
    } else throw getRoutinePropertiesError('activeCriteria', obj.activeCriteria);

    if(
      'daysOfWeek' in obj &&
      Array.isArray(obj.daysOfWeek) &&
      obj.daysOfWeek.every((d: any) => typeof d === 'string' && keys(DayOfWeek).includes(d))
    ){
      fm.setDaysOfWeek(obj.daysOfWeek);
    } else throw getRoutinePropertiesError('daysOfWeek', obj.daysOfWeek);

    if(
      'daysOfMonth' in obj &&
      Array.isArray(obj.daysOfMonth) &&
      obj.daysOfMonth.every((d: any) => typeof d === 'number' && 0 <= d  && d <= 31)
    ){
      fm.setDaysOfMonth(obj.daysOfMonth);
    } else throw getRoutinePropertiesError('daysOfMonth', obj.daysOfMonth);

    return fm;
  }

  serialize(): string {
    const frontmatter = [
      "---",
      stringifyYaml(this.toJSON()),
      "---"
    ].join('\n');
    return frontmatter;
  }

  toJSON(): RoutinePropertiesDto {
    return {
      order: this.getOrder(),
      group: this.getGroup(),
      showOnCalendar: this.isShowOnCalendar(),
      activeCriteria: this.getActiveCriteria(),
      daysOfWeek: this.getDaysOfWeek(),
      daysOfMonth: this.getDaysOfMonth(),
    }
  }

  setOrder(order: number){
    if(order < 0){
      throw new Error('Order must be a non-negative integer.');
    }
    this.order = order;
    return this;
  }

  setGroup(group: string){
    this.group = group;
  }

  ungroup(){
    this.group = "UNGROUPED";
  }

  setShowOnCalendar(showOnCalendar: boolean){
    this.showOnCalendar = showOnCalendar;
  }

  setActiveCriteria(activeCriteria: "week" | "month"){
    this.activeCriteria = activeCriteria;
  }

  setDaysOfWeek(daysOfWeek: DayOfWeek[]){
    this.daysOfWeek = [...daysOfWeek];
  }

  addDaysOfWeek(dayOfWeek: DayOfWeek){
    this.daysOfWeek.push(dayOfWeek);
  }

  setDaysOfMonth(daysOfMonth: number[]): Result<number[], string> {
    this.daysOfMonth = [];
    for(const dayOfMonth of daysOfMonth){
      const result = this.addDayOfMonth(dayOfMonth);
      if(result.isErr()){
        return err(result.error);
      }
    }
    return ok(this.daysOfMonth);
  }

  addDayOfMonth(dayOfMonth: number): Result<number, string> {
    if(dayOfMonth < 0 || dayOfMonth > 31){
      return err('out-of-range'); // 0 ~ 31
    }

    this.daysOfMonth.push(dayOfMonth);
    return ok(dayOfMonth);
  }

  // *********************************************************
  // ********************** Getters ************************** 
  // *********************************************************
  getOrder(){
    return this.order;
  }
  
  getGroup(){
    return this.group;
  }

  isShowOnCalendar(){
    return this.showOnCalendar;
  }

  getActiveCriteria(){
    return this.activeCriteria;
  }
  
  getDaysOfMonth(){
    return [...this.daysOfMonth];
  }

  getDaysOfWeek(){
    return [...this.daysOfWeek];
  }
}
