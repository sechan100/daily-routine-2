import { Checkable } from "@/entities/types/dr-nodes";
import { Day, DayFormat } from "@/shared/period/day";
import { Month } from "@/shared/period/month";



export type Calendar = {
  month: Month;
  tiles: Map<DayFormat, Tile>;
}

export type Tile = {
  day: Day;
  checkables: Checkable[]; // 0 ~ n개
}