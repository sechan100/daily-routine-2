import { create } from "zustand";

export type DrTabType = "calendar" | "note" | "achivement";

interface UseTabRoute {
  tab: DrTabType;
  route: (tab: DrTabType, routeParams: object | null) => void;
  routeParams: object | null;
}
export const useTabRoute = create<UseTabRoute>((set, get) => ({
  tab: "note",
  route: (tab, routeParams = null) => {
    set({ tab, routeParams });
  },
  routeParams: null,
}));
