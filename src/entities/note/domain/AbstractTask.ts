/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObsidianFileTitleValidation, validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";
import { RoutineTaskDto, TaskDto, TodoTaskDto } from "../types/task";
import { TaskElement } from "./TaskElement";
import { TaskParent } from "./TaskParent";


type TaskNameValidation = 'duplicated' | & ObsidianFileTitleValidation;


export abstract class AbstractTask<T extends TaskDto = RoutineTaskDto | TodoTaskDto> implements TaskElement<T> {
  private name: string;
  private checked: boolean;
  private showOnCalendar: boolean;
  /**
   * null은 초기화되지 않음을 의미(lazy initialization)
   */
  private parent: TaskParent | null;

  constructor(
    name: string,
    checked: boolean,
    showOnCalendar: boolean,
    parent?: TaskParent
  ){
    this.name = name;
    this.checked = checked;
    this.showOnCalendar = showOnCalendar;
    this.parent = parent??null;
  }

  abstract toJSON(): T;
  abstract serialize(): string;

  static investigateTaskType(line: string): "routine" | "todo" {
    line = line.trim();
    if(line === '') throw new Error('empty-line');

    const metaDataErr = 'invalid-task-meta-data-format';
    const regex = /%%(.*?)%%/;
    const match = line.match(regex);
    if(!match) throw new Error(metaDataErr);
    const metaData = JSON.parse(match[1]);
    if("type" in metaData === false) throw new Error(metaDataErr);
    
    return metaData.type;
  }

  check(check?: boolean){
    this.checked = check !== undefined ? check : true;
  }

  setShowOnCalendar(show?: boolean){
    this.showOnCalendar = show !== undefined ? show : true;
  }

  changeName(newName: string, taskNames: string[]): Result<string, TaskNameValidation> {
    return AbstractTask
    .validateName(newName, taskNames)
    .andThen(validated => {
      this.name = validated;
      return ok(validated);
    });
  }

  static validateName(name: string, taskNames: string[]): Result<string, TaskNameValidation> {
    return validateObsidianFileTitle(name)
    .andThen(validated => {
      taskNames = taskNames.filter(tn => tn !== name);
      return taskNames.includes(validated) ? err('duplicated') : ok(validated);
    });
  }

  isChecked(){
    return this.checked;
  }

  getName(){
    return this.name;
  }

  isShowOnCalendar(){
    return this.showOnCalendar;
  }

  setParent(newParent: TaskParent | null){
    this.parent = newParent;
  }

  getParent(): TaskParent {
    if(this.parent === null) throw new Error('This task is orphan');
    return this.parent;
  }

  isOrphan(){
    return this.parent === null;
  }

  makeOrphan(): boolean {
    const p = this.parent;
    if(p !== null){
      p.removeEl(this.name);
      this.parent = null;
      return true;
    } else {
      return false;
    }
  }


}