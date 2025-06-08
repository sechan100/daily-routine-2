import { Checkable } from "@/entities/checkable";



export type TaskPropertiesArray = [
  boolean // showOnCalendar
]

export type TaskProperties = {
  showOnCalendar: boolean;
}

export type Task = Checkable & {
  name: string;
  properties: TaskProperties;
}
