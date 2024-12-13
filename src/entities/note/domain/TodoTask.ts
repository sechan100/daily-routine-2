import { AbstractTask } from './AbstractTask';
import { TaskMetaData, TodoTaskDto } from '../types/task';
import { TaskGroup } from './TaskGroup';
import { err, ok, Result } from 'neverthrow';
import { TaskParent } from './TaskParent';


export class TodoTask extends AbstractTask<TodoTaskDto> {
  constructor(
    name: string,
    checked: boolean,
    showOnCalendar: boolean,
    parent?: TaskParent
  ){
    super(name, checked, showOnCalendar, parent);
  }

  static initTask(name: string): TodoTask {
    return new TodoTask(name, false, true);
  }

  static fromJSON(json: TodoTaskDto): TodoTask {
    return new TodoTask(
      json.name,
      json.checked,
      json.showOnCalendar,
    )
  }

  static deserialize(line: string): Result<TodoTask, string> {
    line = line.trim();
    if(line === '') return err('empty-line');

    const regex = /-\s*\[(x|\s?)\]\s*(\[\[(.*?)\]\]|(.*?))\s*%%(.*?)%%/;
    const match = line.match(regex);
    if(!match) return err('invalid-task-format');
    
    const checked = match[1] === 'x';
    const name = match[3] || match[4];
    const metaData = JSON.parse(match[5]);

    return ok(new TodoTask(
      name,
      checked,
      metaData.soc,
    ))
  }

  serialize(): string {
    const c = this.isChecked() ? 'x' : ' ';
    const meta = {
      type: 'todo',
      soc: Number(this.isShowOnCalendar())
    }
    return `- [${c}] ${this.getName()}%%${JSON.stringify(meta)}%%`;
  }

  toJSON(): TodoTaskDto {
    return {
      elementType: 'task',
      taskType: 'todo',
      name: this.getName(),
      checked: this.isChecked(),
      showOnCalendar: this.isShowOnCalendar(),
    }
  }


}