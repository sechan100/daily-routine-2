/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonConvertible } from "@shared/JsonConvertible";
import { TaskElementDto } from "../types/task";



export interface TaskElement<T extends TaskElementDto> extends JsonConvertible<T> {
  getName(): string;
  serialize(): string;
}