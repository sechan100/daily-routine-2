import { isRoutineNote, isRoutineTask, isTaskGroup, NoteElement, NoteService, Task, TaskEntity, TaskGroup, TaskParent } from "@/entities/note";
import { GroupService, isRoutine, isRoutineGroup, Routine, RoutineElement, RoutineGroupEntity, RoutineService } from "@/entities/routine-like";
import { useRoutineNoteStore } from '../../../model/use-routine-note';



type OrderChangeList = RoutineElement[];

const ORDER_OFFSET = 1000;

const loadRoutineElementRegistry = async () => {
  const routineMap = new Map<string, Routine>([...await RoutineService.loadAll()].map(r => [r.name, r]));
  const groupMap = new Map<string, RoutineElement>([...await GroupService.loadAll()].map(g => [g.name, g]));

  return (name: string, type: "routine" | "routine-group"): RoutineElement | null => {
    if (type === "routine") {
      const r = routineMap.get(name);
      return r ?? null;
    } else {
      const g = groupMap.get(name);
      return g ?? null;
    }
  }
}


/**
 * parent의 자식의 순서들을 반영하여 order, group등이 적절하게 변경된 Routine, RoutineGroup의 배열을 반환한다.
 * @param parent 
 */
const resolveChangeList = async (parent: TaskParent): Promise<OrderChangeList> => {
  const get = await loadRoutineElementRegistry();

  type Acc = {
    changeList: OrderChangeList;
    prevOrder: number;
  }
  return parent.children
    .filter(c => isTaskGroup(c) || isRoutineTask(c))
    .flatMap(c => {
      const routineElementType = isTaskGroup(c) ? "routine-group" : "routine";
      const rOrG = get(c.name, routineElementType);

      /**
       * 과거의 노트를 편집할 때, 현재는 존재하지 않는 routine이나 group이 존재할 수 있다.
       * 즉, registry에서 rOrG를 찾지 못할 수 있다.
       */
      if (rOrG) {
        return [rOrG];
      } else {
        console.info(`Routine, or RoutineGroup not exist currently. (name: '${c.name})'`);
        return [];
      }
    })
    .reduce((acc, el) => {
      // order
      let currentOrder = el.properties.order;
      if (!(acc.prevOrder < currentOrder)) {
        currentOrder = acc.prevOrder + ORDER_OFFSET;
        el.properties.order = currentOrder;
      }
      acc.prevOrder = currentOrder;

      // group
      if (isRoutine(el)) {
        const group = el.properties.group;
        if (isRoutineNote(parent) && group !== RoutineGroupEntity.UNGROUPED_NAME) {
          el.properties.group = RoutineGroupEntity.UNGROUPED_NAME;
        }
        else if (isTaskGroup(parent) && group !== parent.name) {
          el.properties.group = parent.name;
        }
      }

      acc.changeList.push(el);
      return acc;
    }, { changeList: [], prevOrder: 0 } as Acc)
    .changeList;
}


/**
 * 새로운 order로 routine, routine-group의 order를 업데이트한다.
 */
const updateRoutineAndRoutineGroups = async (parent: TaskParent) => {
  if (isTaskGroup(parent)) {
    /**
     * 현재는 존재하지 않는 Group 안으로 task가 드롭된 경우, 존재하지 않는 group으로 task가 할당될 수 있다. 
     * 이 경우는 updateRoutineAndRoutineGroups을 처리해선 안된다.
     */
    const isGroupExist = GroupService.isExist(parent.name);
    if (!isGroupExist) return;
  }

  const list = await resolveChangeList(parent);
  for (const el of list) {
    if (isRoutine(el)) {
      await RoutineService.update(el);
    } else if (isRoutineGroup(el)) {
      await GroupService.update(el);
    } else {
      throw new Error("Invalid RoutineElement");
    }
  }
}


type AddTaskArgs = {
  parent: TaskParent;
  base: NoteElement;
  target: NoteElement;
  pos: "before" | "after";
}
const addTask = ({
  parent,
  base,
  target: task,
  pos
}: AddTaskArgs) => {
  const idx = parent.children.findIndex(t => t.name === base.name);
  if (pos === "before") {
    parent.children.splice(idx, 0, task);
  } else {
    parent.children.splice(idx + 1, 0, task);
  }
}

/***************************************************
 ******** task, group dnd에서 가능한 4가지 케이스 ********
 ***************************************************/

type TaskOnTask = {
  dropped: Task;
  on: Task;
  hit: "top" | "bottom";
}
const taskDropOnTask = async (args: TaskOnTask) => {
  if (args.dropped.name === args.on.name) throw new Error("Cannot drop on itself");
  const note = { ...useRoutineNoteStore.getState().note };

  const on = NoteService.findTask(note, args.on.name);
  const dropped = NoteService.findTask(note, args.dropped.name);
  if (!on || !dropped) throw new Error("Dest Task or Dropped Task not found");

  TaskEntity.removeTask(note, dropped.name);
  const parent = NoteService.findParent(note, on.name);
  addTask({
    parent,
    base: on,
    target: dropped,
    pos: args.hit === "top" ? "before" : "after"
  })
  await updateRoutineAndRoutineGroups(parent);
  return note;
}


type GroupOnTask = {
  dropped: TaskGroup;
  on: Task;
  hit: "top" | "bottom";
}
const groupDropOnTask = async (args: GroupOnTask) => {
  const note = { ...useRoutineNoteStore.getState().note };
  const root = note.children;
  const on = root.find(t => t.name === args.on.name);
  const dropped = root.find(t => t.name === args.dropped.name);
  if (!on || !dropped) throw new Error("Dest Task or Dropped Task not found. Or group has dropped in another group.");

  TaskEntity.removeTask(note, dropped.name);
  addTask({
    parent: note,
    base: on,
    target: dropped,
    pos: args.hit === "top" ? "before" : "after"
  })
  await updateRoutineAndRoutineGroups(note);
  return note;
}


type TaskOnGroup = {
  dropped: Task;
  on: TaskGroup;
  hit: "top" | "bottom" | "in";
}
const taskDropOnGroup = async (args: TaskOnGroup) => {
  const note = { ...useRoutineNoteStore.getState().note };
  const on = NoteService.findGroup(note, args.on.name);
  const dropped = NoteService.findTask(note, args.dropped.name);
  if (!on || !dropped) throw new Error("Dest Group or Dropped Task not found.");

  TaskEntity.removeTask(note, dropped.name);
  let parent: TaskParent;
  if (args.hit === "in") {
    on.children.unshift(dropped);
    parent = on;
  } else {
    addTask({
      parent: note,
      base: on,
      target: dropped,
      pos: args.hit === "top" ? "before" : "after"
    })
    parent = note;
  }
  await updateRoutineAndRoutineGroups(parent);
  return note;
}


type GroupOnGroup = {
  dropped: TaskGroup;
  on: TaskGroup;
  hit: "top" | "bottom";
}
const groupDropOnGroup = async (args: GroupOnGroup) => {
  const note = { ...useRoutineNoteStore.getState().note };
  const root = note.children;
  const on = root.find(t => t.name === args.on.name);
  const dropped = root.find(t => t.name === args.dropped.name);
  if (!on || !dropped) throw new Error("Dest Group or Dropped Group not found.");

  TaskEntity.removeTask(note, dropped.name);
  addTask({
    parent: note,
    base: on,
    target: dropped,
    pos: args.hit === "top" ? "before" : "after"
  })
  await updateRoutineAndRoutineGroups(note);
  return note;
}


export const DroppedElReplacer = {
  taskDropOnTask,
  groupDropOnTask,
  taskDropOnGroup,
  groupDropOnGroup,
}