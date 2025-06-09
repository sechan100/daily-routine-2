import { Task } from "@/entities/task";
import { create } from "zustand";



export type TasksStore = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}
export const useTasksStore = create<TasksStore>()((set, get) => ({
  tasks: [],
  setTasks: (tasks: Task[]) => set({ tasks })
}));