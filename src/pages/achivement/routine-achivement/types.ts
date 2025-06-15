import { CheckableState } from "@/entities/types/checkable";
import { Day, DayFormat } from "@/shared/period/day";


export type TileMap = Map<DayFormat, Tile>;
export type Tile = {
  day: Day;
  state: CheckableState | "inactive";
}