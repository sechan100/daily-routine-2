import { Task } from "@entities/note";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";



export interface Calendar {
	month: Month;
	tiles: Tile[]; // 28 ~ 31개
}

export interface Tile {
	day: Day;
	tasks: Task[] // 0 ~ n개
}