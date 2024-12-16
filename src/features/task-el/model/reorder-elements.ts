import { isRoutineNote, isTaskGroup, NoteElement, NoteEntity, noteRepository, RoutineNote, Task, TaskGroup, TaskParent } from "@entities/note";
import { groupRepository, GroupRepository, isRoutine, RoutineElement, RoutineGroupEntity, routineRepository, RoutineRepository } from "@entities/routine";
import { useRoutineNote } from "@features/note";



type OrderChangeList = RoutineElement[];

const ORDER_OFFSET = 1000;
/**
 * parent의 자식의 순서들을 반영하여 order, group등이 적절하게 변경된 Routine, RoutineGroup의 배열을 반환한다.
 * @param parent 
 */
const resolveChangeList = async (parent: TaskParent): Promise<OrderChangeList> => {
  const routines = await routineRepository.loadAll();
  const groups = await groupRepository.loadAll();
  const map = new Map<string, RoutineElement>([...routines, ...groups].map(r => [r.name, r]));

  type Acc = {
    changeList: OrderChangeList;
    prevOrder: number;
  }
  return parent.children
  .map(c => {
    const rOrG = map.get(c.name);
    if(!rOrG) throw new Error("Routine or Group not found");
    return rOrG;
  })
  .reduce((acc, el) => {
    // order
    let currentOrder = el.properties.order;
    if(!(acc.prevOrder < currentOrder)){
      currentOrder = acc.prevOrder + ORDER_OFFSET;
      el.properties.order = currentOrder;
    }
    acc.prevOrder = currentOrder;

    // group
    if(isRoutine(el)){
      const group = el.properties.group;
      if(isRoutineNote(parent) && group !== RoutineGroupEntity.UNGROUPED_NAME){
        el.properties.group = RoutineGroupEntity.UNGROUPED_NAME;
      }
      else if(isTaskGroup(parent) && group !== parent.name){
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
  const list = await resolveChangeList(parent);
  for(const el of list){
    if(isRoutine(el)){
      await routineRepository.update(el);
    } else {
      await groupRepository.update(el);
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
  if(pos === "before"){
    parent.children.splice(idx, 0, task);
  } else {
    parent.children.splice(idx + 1, 0, task);
  }
}

type TaskOnTask = {
  dropped: Task;
  on: Task;
  hit: "top" | "bottom";
}
const taskDropOnTask = async (args: TaskOnTask) => {
  if(args.dropped.name === args.on.name) throw new Error("Cannot drop on itself");
  const note = { ...useRoutineNote.getState().note };
  
  const on = NoteEntity.findTask(note, args.on.name);
  const dropped = NoteEntity.findTask(note, args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Task or Dropped Task not found");

  NoteEntity.removeTask(note, dropped.name);
  const parent = NoteEntity.findParent(note, on.name);
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
  const note = { ...useRoutineNote.getState().note };
  const root = note.children;
  const on = root.find(t => t.name === args.on.name);
  const dropped = root.find(t => t.name === args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Task or Dropped Task not found. Or group has dropped in another group.");

  NoteEntity.removeTask(note, dropped.name);
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
  const note = { ...useRoutineNote.getState().note };
  const on = NoteEntity.findGroup(note, args.on.name);
  const dropped = NoteEntity.findTask(note, args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Group or Dropped Task not found.");
  
  NoteEntity.removeTask(note, dropped.name);
  let parent: TaskParent;
  if(args.hit === "in"){
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
const groupDropOnGroup = async (args: GroupOnGroup)=> {
  const note = { ...useRoutineNote.getState().note };
  const root = note.children;
  const on = root.find(t => t.name === args.on.name);
  const dropped = root.find(t => t.name === args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Group or Dropped Group not found.");

  NoteEntity.removeTask(note, dropped.name);
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