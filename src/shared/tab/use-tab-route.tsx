import { create } from "zustand";
import { INITIAL_TAB } from "./initial-tab";

export type DrTabType = "calendar" | "note" | "achievement";

interface UseTabRoute {
  tab: DrTabType;
  route: (tab: DrTabType, routeParams: object | null) => void;
  routeParams: object | null;
}
export const useTabRoute = create<UseTabRoute>((set, _get) => ({
  tab: INITIAL_TAB,
  route: (tab, routeParams = null) => {
    set({ tab, routeParams });
  },
  routeParams: null,
}));
