import { createStoreContext } from "@shared/zustand/create-store-context";
import { DayNode } from "./types";



export const [WeeksActiveDayContextProvider, useWeeksActiveDay] = createStoreContext<DayNode, DayNode>((data, set, get) => ({
  day: data.day,
  percentage: data.percentage,
}));