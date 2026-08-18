import { createStoreContext } from "@shared/zustand/create-store-context";
import { DayNode } from "./types";



export const [WeeksActiveDayContextProvider, useWeeksActiveDay] = createStoreContext<DayNode, DayNode>((data, _set, _get) => ({
  day: data.day,
  performance: data.performance,
}));