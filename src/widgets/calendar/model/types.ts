import { TaskDto } from "@entities/note";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";



export interface Calendar {
	month: Month;
	tiles: Map<string, Tile>;
}

export interface Tile {
	day: Day;
	tasks: TaskDto[] // 0 ~ n개
}