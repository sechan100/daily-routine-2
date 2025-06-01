import { CheckableState, Task } from "@/entities/note";
import { create } from "zustand";



export type TasksStore = {
  tasks: Task[];
  actions: {
    addTask: (task: Task) => void;
    removeTask: (name: string) => void;
    check: (name: string, state: CheckableState) => void;
    setTasks: (tasks: Task[]) => void;
  }
}
export const useTasksStore = create<TasksStore>()((set, get) => ({
  tasks: [],

  ///////////////// actions ////////////////////
  actions: {

    addTask: (task: Task) => {
      const newTasks = [task, ...get().tasks];
      set({ tasks: newTasks });
    },

    removeTask: (name: string) => {
      set((state) => ({
        tasks: state.tasks.filter(task => task.name !== name),
      }));
    },

    check: (name: string, state: CheckableState) => {
      const newTasks = get().tasks.map(task => {
        if (task.name === name) {
          return { ...task, state };
        }
        return task;
      });
      set({ tasks: newTasks });
    },

    setTasks: (tasks: Task[]) => set({ tasks }),
  }
}));