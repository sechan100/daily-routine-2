/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaskDto, TaskGroupDto } from "../types/task";
import { AbstractTask } from "./AbstractTask";
import { err, ok, Result } from "neverthrow";
import { validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { TaskElement } from "./TaskElement";
import dedent from "dedent";
import { TaskParent } from "./TaskParent";
import { RoutineGroup } from "@entities/routine";
import { RoutineTask } from "./RoutineTask";
import { TodoTask } from "./TodoTask";
import { remove } from "lodash";


export class TaskGroup implements TaskElement<TaskGroupDto>, TaskParent {
  private name: string;
  private tasks: AbstractTask[];

  constructor(name: string, orderedTasks: AbstractTask[]){
    this.name = name;

    orderedTasks.forEach(t => t.setParent(this));
    this.tasks = [...orderedTasks];
  }

  toJSON(): TaskGroupDto {
    return {
      elementType: 'group',
      name: this.name,
      tasks: this.tasks.map(t => t.toJSON()),
    }
  }

  static fromJSON(json: TaskGroupDto): TaskGroup {
    const group = new TaskGroup(
      json.name,
      json.tasks.map(task => {
        if(task.taskType === 'routine'){
          return new RoutineTask(task.name, task.checked, task.showOnCalendar);
        } else {
          return new TodoTask(task.name, task.checked, task.showOnCalendar);
        }
      })
    );
    return group;
  }

  getChildren(): TaskElement<any>[] {
    return this.getTasks();
  }

  getTasks(){
    return [...this.tasks];
  }

  getTask(name: string): AbstractTask | null {
    return this.tasks.find(t => t.getName() === name) || null;
  }

  /**
   * task를 해당 TaskGroup에 추가한다. 
   * task 이전에 이미 어떤(해당 Group 포함) TaskGroup, 또는 RoutineNote에 속해있었던 경우에는 그로부터 먼저 제거된다.
   */
  addTask(
    task: AbstractTask, 
    idx: (arr: TaskElement<any>[]) => number = () => 0
  ): Result<AbstractTask, string> {
    task.makeOrphan();
    task.setParent(this);
    this.tasks.splice(idx(this.tasks), 0, task);
    return ok(task);
  }

  changeName(newName: string, taskNames: string[]): Result<string, string> {
    return AbstractTask
    .validateName(newName, taskNames)
    .andThen(validated => {
      this.name = validated;
      return ok(validated);
    });
  }

  /**
   * 
   * @param groupBlock: 
   * `
   * ## {name}
   * ...tasks?
   * ` 형식의 마크다운 블록
   */
  static deserialize(groupBlock: string): Result<TaskGroup, string> {
    const regex = /##\s*(.+?)\s*(?:\n([\s\S]*?))?(?=\n##|$)/;
    const match = groupBlock.match(regex);
    if(!match) return err('invalid-group-format');
    const name = match[1].trim();
    const taskLines = match[2]?.trim().split("\n") ?? [];
    const tasks: AbstractTask[] = taskLines
      .map(l => {
        if(AbstractTask.investigateTaskType(l) === "routine"){
          return RoutineTask.deserialize(l);
        } else {
          return TodoTask.deserialize(l);
        }
      })
      .map(result => {
        if(result.isErr()){
          throw new Error(`Error while deserializing task: ${result.error}`);
        } else {
          return result.value;
        }
      });

    return ok(new TaskGroup(name, tasks));
  }

  serialize(): string {
    return dedent`
      ## ${this.name}
      ${this.tasks.map(t => t.serialize()).join('\n')}
    `;
  }

  static validateName(name: string, taskNames: string[]): Result<string, string> {
    return validateObsidianFileTitle(name)
    .andThen(validated => {
      taskNames = taskNames.filter(tn => tn !== name);
      return taskNames.includes(validated) ? err('duplicated') : ok(validated);
    })
    .andThen(validated => {
      return validated === 'UNGROUPED' ? err('reserved-name') : ok(validated);
    })
  }

  getName(){
    return this.name;
  }

  moveTaks(name: string, targetIdx: number): void {
    const idx = this.tasks.findIndex(t => t.getName() === name);
    if(idx === -1) throw new Error('Task not found');
    const task = this.tasks.splice(idx, 1)[0];
    this.tasks.splice(targetIdx, 0, task);
  }

  removeEl(name: string){
    const idx = this.tasks.findIndex(t => t.getName() === name);
    if(idx === -1) throw new Error('Remove Target Task not found');
    const removed = this.tasks.splice(idx, 1);
    removed[0].setParent(null);
  }
}