/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractTask } from "./AbstractTask";
import { TaskElement } from "./TaskElement";


export interface TaskParent {
  removeEl(name: string): void;
  /**
   * 
   * @param task 
   * @param idx task가 이미 해당 부모에게 속해있다면 추가하기전에 먼저 제거된다.
   * 이 경우 외부에서 따로 계산한 index와 원하는 삽입 index가 달라질 수 있기 때문에 callback을 통해 index를 lazy하게 계산해야한다.
   */
  addTask(task: AbstractTask, idx?: (arr: TaskElement<any>[]) => number): void;
  getChildren(): TaskElement<any>[];
}