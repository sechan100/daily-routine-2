


export interface TaskElementDto {
  elementType: "group" | "task";
  name: string;
}

export interface TaskGroupDto extends TaskElementDto {
  elementType: "group";
  tasks: TaskDto[];
}

export type TaskType = "routine" | "todo";

export interface TaskDto extends TaskElementDto {
  taskType: TaskType;
  checked: boolean;
  showOnCalendar: boolean;
}

export interface RoutineTaskDto extends TaskDto { }

export interface TodoTaskDto extends TaskDto { }

export interface TaskMetaData {
  type: TaskType;
  soc: boolean; // showOnCalendar
}
