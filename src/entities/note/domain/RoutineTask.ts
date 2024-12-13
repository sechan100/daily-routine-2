import { AbstractTask } from "./AbstractTask";
import { RoutineTaskDto } from "../types/task";
import { err, ok, Result } from "neverthrow";
import { TaskParent } from "./TaskParent";
import { Routine } from "@entities/routine";


export class RoutineTask extends AbstractTask<RoutineTaskDto> {

  constructor(
    name: string,
    checked: boolean,
    showOnCalendar: boolean,
    parent?: TaskParent
  ){
    super(name, checked, showOnCalendar, parent);
  }

  static create(name: string): RoutineTask {
    return new RoutineTask(name, false, false);
  }

  static fromRoutine(routine: Routine): RoutineTask {
    return new RoutineTask(
      routine.getName(), 
      false, 
      routine.getProperties().isShowOnCalendar()
    );
  }

  static fromJSON(json: RoutineTaskDto): RoutineTask {
    return new RoutineTask(
      json.name,
      json.checked,
      json.showOnCalendar
    )
  }

  static deserialize(line: string): Result<RoutineTask, string> {
    line = line.trim();
    if(line === '') return err('empty-line');

    const regex = /-\s*\[(x|\s?)\]\s*(\[\[(.*?)\]\]|(.*?))\s*%%(.*?)%%/;
    const match = line.match(regex);
    if(!match) return err('invalid-task-format');
    
    const checked = match[1] === 'x';
    const name = match[3] || match[4];
    const metaData = JSON.parse(match[5]);

    return ok(new RoutineTask(
      name,
      checked,
      metaData.soc
    ))
  }

  serialize(): string {
    const c = this.isChecked() ? 'x' : ' ';
    const meta = {
      type: 'routine',
      soc: Number(this.isShowOnCalendar())
    }
    return `- [${c}] [[${this.getName()}]]%%${JSON.stringify(meta)}%%`;
  }

  toJSON(): RoutineTaskDto {
    return {
      elementType: 'task',
      taskType: 'routine',
      name: this.getName(),
      checked: this.isChecked(),
      showOnCalendar: this.isShowOnCalendar(),
    }
  }

}