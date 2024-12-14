/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonConvertible } from "@shared/JsonConvertible";
import { Day } from "@shared/period/day";
import dedent from "dedent";
import { err, ok, Result } from "neverthrow";
import { NoteCompletion, RoutineNoteDto } from "../types/routine-note";
import { AbstractTask } from "./AbstractTask";
import { TaskElement } from "./TaskElement";
import { TaskGroup } from "./TaskGroup";
import { TaskParent } from "./TaskParent";
import { TaskDto, TaskGroupDto } from "../types/task";
import { RoutineTask } from "./RoutineTask";
import { TodoTask } from "./TodoTask";



type TaskEl = TaskElement<any>;


export class RoutineNote implements JsonConvertible<RoutineNoteDto>, TaskParent {
  private day: Day;
  private root: TaskEl[];

  constructor(day: Day, root: TaskEl[]){
    this.day = day;
    root.forEach(t => {
      if(t instanceof AbstractTask) t.setParent(this);
    });
    this.root = [...root];
  }

  static fromJSON(json: RoutineNoteDto): RoutineNote {
    const root = json.root.map(t => {
      if(t.elementType === 'group'){
        return TaskGroup.fromJSON(t as TaskGroupDto);
      } else {
        const json = t as TaskDto;
        if(json.taskType === 'routine'){
          return new RoutineTask(json.name, json.checked, json.showOnCalendar);
        } else {
          return new TodoTask(json.name, json.checked, json.showOnCalendar);
        }
      }
    });
    return new RoutineNote(json.day, root);
  }

  getCompletion(): NoteCompletion {
    const tasks = this.createTaskArray();
    const total = tasks.length;
    const completed = tasks.filter(t => t.isChecked()).length;
    const uncompleted = total - completed;
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    const percentageRounded = Math.round(percentage);
    return { total, completed, uncompleted, percentage, percentageRounded };
  }

  getDay(): Day {
    return this.day.clone();
  }

  toJSON(): RoutineNoteDto {
    return {
      day: this.day.clone(),
      root: this.root.map(t => t.toJSON())
    }
  }

  static deserialize(day: Day, content: string): Result<RoutineNote, string> {
    const regex = /##\s+.*(?:\n(?!##|$).*)*/g;
    const blocks = content.match(regex);
    if(!blocks) return err('no-task-blocks');

    const root: TaskEl[] = blocks.flatMap(b => {
      if(b.startsWith("## UNGROUPED")){
        const lines = b.replace("## UNGROUPED", '').trim().split('\n');
        return lines
          .map(l => {
            if(AbstractTask.investigateTaskType(l) === "routine"){
              return RoutineTask.deserialize(l);
            } else {
              return TodoTask.deserialize(l);
            }
          })
          .map(r => {
            if(r.isErr()) throw new Error('task deserialization error: ' + r.error);
            return r.value;
          })
      } else {
        const result = TaskGroup.deserialize(b);
        if(result.isErr()) throw new Error('group deserialization error: ' + result.error);
        return [result.value] as TaskEl[];
      }
    });

    return ok(new RoutineNote(day, root));

  }

  serialize() {
    type ElBlock = {
      isUngroupedTaskBlock: boolean;
      serialized: string;
    }
    const taskElBlocks: ElBlock[] = [];

    for(const el of this.root){
      let elBlock: ElBlock;

      if(el instanceof TaskGroup){
        elBlock = {
          isUngroupedTaskBlock: false,
          serialized: el.serialize()
        }
      } else if(el instanceof AbstractTask){
        const prev = taskElBlocks[taskElBlocks.length - 1];
        if(prev && prev.isUngroupedTaskBlock){
          prev.serialized += '\n' + el.serialize();
          continue;
        } else {
          elBlock = {
            isUngroupedTaskBlock: true,
            serialized: el.serialize()
          }
        }
      } else { 
        throw new Error('Invalid TaskElement Type'); 
      }

      taskElBlocks.push(elBlock);
    }

    const tasks = taskElBlocks.map(block => {
      if(block.isUngroupedTaskBlock){
        return dedent`
          ## UNGROUPED
          ${block.serialized}
        `;
      } else {
        return block.serialized;
      }
    }).join('\n');


    return dedent`
      # Tasks
      ${tasks}
    `;
  }


  createTasksMap(): Map<string, AbstractTask> {
    const map = new Map<string, AbstractTask>();
    for(const el of this.root){
      if(el instanceof TaskGroup){
        el.getTasks().forEach(t => map.set(t.getName(), t));
      } else {
        map.set(el.getName(), el as AbstractTask);
      }
    }
    return map;
  }

  createTaskArray(): AbstractTask[] {
    const arr = [];
    for(const el of this.root){
      if(el instanceof TaskGroup){
        arr.push(...el.getTasks());
      } else {
        arr.push(el as AbstractTask);
      }
    }
    return arr;
  }
  
  // *******************************
  // *********** Node **************
  // *******************************

  findNode(name: string, type: "group" | "task"): TaskEl | null {
    for(const el of this.root){
      if(el instanceof TaskGroup){
        if(type === "group" && el.getName() === name) return el;
        const found = el.getTask(name);
        if(found) return found;
      } else {
        if(type === "task" && el.getName() === name) return el;
      }
    }
    return null;
  }

  getChildren(): TaskElement<any>[] {
    return [...this.root];
  }

  addTask(
    task: AbstractTask, 
    idx: (arr: TaskElement<any>[]) => number = () => 0
  ): void {
    this.addEl(task, idx);
  }

  /**
   * 
   * @param el 다른 어느 곳에도 소속되지 않은 TaskElement. 만약 el이 이미 부모가 존재한다면 addEl에 실패한다.
   * @param idx 
   * @returns 
   */
  addEl(
    el: TaskEl, 
    idx: (arr: TaskElement<any>[]) => number = () => 0
  ): Result<TaskEl, string> {
    if(el instanceof AbstractTask){
      el.makeOrphan();
      el.setParent(this);
    } else if(el instanceof TaskGroup){
      this.removeEl(el.getName());
    } else {
      return err('Invalid TaskElement Type');
    }
    this.root.splice(idx(this.root), 0, el);
    return ok(el);
  }

  findTask(name: string): AbstractTask | null {
    const found = this.findNode(name, "task");
    if(found instanceof AbstractTask) return found;
    return null;
  }

  findGroup(name: string): TaskGroup | null {
    const found = this.root.find(e => e.getName() === name);
    if(found instanceof TaskGroup) return found;
    return null;
  }

  removeEl(name: string): void {
    const idx = this.root.findIndex(el => el.getName() === name);
    if(idx === -1) throw new Error('Remove Target TaskElement not found');
    const removed = this.root.splice(idx, 1);
    if(removed[0] instanceof AbstractTask){
      (removed[0] as AbstractTask).setParent(null);
    }
  }

  deleteTask(name: string): boolean {
    const task = this.findTask(name);
    if(!task) return false;
    task.getParent()?.removeEl(name);
    return true;
  }

  deleteGroup(name: string, deleteSubTask = false): boolean {
    const group = this.findGroup(name);
    if(!group) return false;

    if(!deleteSubTask){
      group.getTasks().forEach(t => this.addEl(t));
    }

    this.removeEl(name);
    return true;
  }
}
