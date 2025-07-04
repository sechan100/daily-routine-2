import { CheckableState } from "@/entities/types/dr-nodes";
import { Day, DayFormat } from "@/shared/period/day";


export type TileMap = Map<DayFormat, Tile>;
export type Tile = {
  day: Day;
  state: CheckableState | "inactive";
}