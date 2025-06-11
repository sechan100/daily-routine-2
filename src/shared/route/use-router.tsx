import { create } from "zustand";
import { PageRouterRegistration, PageType } from "./page-type";

interface UseRouter {
  current: PageRouterRegistration | null;
  pages: PageRouterRegistration[];
  route: (page: PageType) => void;
}
export const useRouter = create<UseRouter>((set, get) => ({
  current: null,
  pages: [],
  route: (page: PageType) => {
    const current = get().pages.find(p => p.name === page) || null;
    set({ current });
  }
}));
