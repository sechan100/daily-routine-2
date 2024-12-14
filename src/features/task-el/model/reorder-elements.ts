import { NoteRepository, RoutineNote, RoutineNoteDto, TaskDto, TaskElementDto, TaskGroup, TaskGroupDto } from "@entities/note";
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { TaskParent } from "@entities/note/domain/TaskParent";
import { GroupRepository, Routine, RoutineGroup, RoutineRepository } from "@entities/routine";
import { useRoutineNote } from "@features/note";
import { flatMap } from "lodash";


const NOTE_DOMAIN = () => {
  return RoutineNote.fromJSON(useRoutineNote.getState().note);
}

const save = async (note: RoutineNote) => {
  if(await NoteRepository.isExist(note.getDay())){
    await NoteRepository.update(note);
  }
}


type RoutineObject = Routine | RoutineGroup;

type OrderChangeList = RoutineObject[];

const ORDER_OFFSET = 1000;
/**
 * parent의 자식의 순서들을 반영하여 order, group등이 적절하게 변경된 Routine, RoutineGroup의 배열을 반환한다.
 * @param parent 
 */
const resolveChangeList = async (parent: TaskParent): Promise<OrderChangeList> => {
  const routines = await RoutineRepository.loadAll();
  const groups = await GroupRepository.loadAll();
  const map = new Map<string, RoutineObject>([...routines, ...groups].map(r => [r.getName(), r]));

  type Acc = {
    changeList: OrderChangeList;
    prevOrder: number;
  }
  
  return parent.getChildren()
  .map(c => {
    const rOrG = map.get(c.getName());
    if(!rOrG) throw new Error("Routine or Group not found");
    return rOrG;
  })
  .reduce((acc, ro) => {
    // order
    let currentOrder = ro.getProperties().getOrder();
    if(!(acc.prevOrder < currentOrder)){
      currentOrder = acc.prevOrder + ORDER_OFFSET;
      ro.getProperties().setOrder(currentOrder);
    }
    acc.prevOrder = currentOrder;

    // group
    if(ro instanceof Routine){
      const group = ro.getProperties().getGroup();
      if(parent instanceof RoutineNote && group !== RoutineGroup.UNGROUPED_NAME){
        ro.getProperties().setGroup(RoutineGroup.UNGROUPED_NAME);
      }
      else if(parent instanceof TaskGroup && group !== parent.getName()){
        ro.getProperties().setGroup(parent.getName());
      }
    }

    acc.changeList.push(ro);
    return acc;
  }, { changeList: [], prevOrder: 0 } as Acc)
  .changeList;
}

/**
 * 새로운 order로 routine, routine-group의 order를 업데이트한다.
 */
const updateRoutineAndRoutineGroups = async (parent: TaskParent) => {
  const list = await resolveChangeList(parent);
  for(const ro of list){
    if(ro instanceof Routine){
      await RoutineRepository.update(ro);
    } else {
      await GroupRepository.update(ro);
    }
  }
}


type TaskOnTask = {
  dropped: TaskDto;
  on: TaskDto;
  hit: "top" | "bottom";
}
const taskDropOnTask = (args: TaskOnTask) => {
  if(args.dropped.name === args.on.name) throw new Error("Cannot drop on itself");
  
  const note = NOTE_DOMAIN();
  const on = note.findTask(args.on.name);
  const dropped = note.findTask(args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Task or Dropped Task not found");

  const parent = on.getParent();
  parent.addTask(dropped, (arr) => {
    const idx = arr.indexOf(on);
    return args.hit === "top" ? idx : idx + 1
  });
  save(note);
  updateRoutineAndRoutineGroups(parent)
  .then(() => executeRoutineNotesSynchronize(note.getDay()));
  return note.toJSON();
}

type GroupOnTask = {
  dropped: TaskGroupDto;
  on: TaskDto;
  hit: "top" | "bottom";
}
const groupDropOnTask = (args: GroupOnTask) => {
  const note = NOTE_DOMAIN();
  const root = note.getChildren();
  const on = root.find(t => t.getName() === args.on.name);
  const dropped = root.find(t => t.getName() === args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Task or Dropped Task not found. Or group has dropped in another group.");

  note.addEl(dropped, (arr) => {
    const idx = arr.indexOf(on);
    return args.hit === "top" ? idx : idx + 1
  });
  save(note);
  updateRoutineAndRoutineGroups(note)
  .then(() => executeRoutineNotesSynchronize(note.getDay()));
  return note.toJSON();
}

type TaskOnGroup = {
  dropped: TaskDto;
  on: TaskGroupDto;
  hit: "top" | "bottom" | "in";
}
const taskDropOnGroup = (args: TaskOnGroup) => {
  const note = NOTE_DOMAIN();
  const on = note.findGroup(args.on.name);
  const dropped = note.findTask(args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Group or Dropped Task not found.");

  let parent: TaskParent;
  if(args.hit === "in"){
    on.addTask(dropped);
    parent = on;
  } else {
    note.addTask(dropped, (arr) => {
      const idx = arr.indexOf(on);
      return args.hit === "top" ? idx : idx + 1
    });
    parent = note;
  }
  save(note);
  updateRoutineAndRoutineGroups(parent)
  .then(() => executeRoutineNotesSynchronize(note.getDay()));
  return note.toJSON();
}

type GroupOnGroup = {
  dropped: TaskGroupDto;
  on: TaskGroupDto;
  hit: "top" | "bottom";
}
const groupDropOnGroup = (args: GroupOnGroup)=> {
  const note = NOTE_DOMAIN();
  const root = note.getChildren();
  const on = root.find(t => t.getName() === args.on.name);
  const dropped = root.find(t => t.getName() === args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Group or Dropped Group not found.");

  note.addEl(dropped, (arr) => {
    const idx = arr.indexOf(on);
    return args.hit === "top" ? idx : idx + 1
  });
  save(note);
  updateRoutineAndRoutineGroups(note)
  .then(() => executeRoutineNotesSynchronize(note.getDay()));
  return note.toJSON();
}



export const DroppedElReplacer = {
  taskDropOnTask,
  groupDropOnTask,
  taskDropOnGroup, 
  groupDropOnGroup,
}