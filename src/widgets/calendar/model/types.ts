import { Task } from "@entities/note";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";



export type Calendar = {
	month: Month;
	tiles: Map<string, Tile>;
}

export type Tile = {
	day: Day;
	tasks: Task[] // 0 ~ n개
}