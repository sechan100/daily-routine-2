import { NoteRepository, RoutineNote, RoutineNoteDto, TaskDto, TaskElementDto, TaskGroupDto } from "@entities/note";
import { useRoutineNote } from "@features/note";


const NOTE_DOMAIN = () => {
  return RoutineNote.fromJSON(useRoutineNote.getState().note);
}

const save = async (note: RoutineNote) => {
  if(await NoteRepository.isExist(note.getDay())){
    await NoteRepository.update(note);
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

  const idx = root.indexOf(on);
  note.addEl(dropped, (arr) => {
    const idx = arr.indexOf(on);
    return args.hit === "top" ? idx : idx + 1
  });
  save(note);

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

  if(args.hit === "in"){
    on.addTask(dropped);
  } else {
    const idx = note.getChildren().indexOf(on);
    note.addTask(dropped, (arr) => {
      const idx = arr.indexOf(on);
      return args.hit === "top" ? idx : idx + 1
    });
  }
  save(note);

  return note.toJSON();
}

type GroupOnGroup = {
  dropped: TaskGroupDto;
  on: TaskGroupDto;
  hit: "top" | "bottom";
}
const groupDropOnGroup = (args: GroupOnGroup) => {
  const note = NOTE_DOMAIN();
  const root = note.getChildren();
  const on = root.find(t => t.getName() === args.on.name);
  const dropped = root.find(t => t.getName() === args.dropped.name);
  if(!on || !dropped) throw new Error("Dest Group or Dropped Group not found.");

  const idx = root.indexOf(on);
  note.addEl(dropped, (arr) => {
    const idx = arr.indexOf(on);
    return args.hit === "top" ? idx : idx + 1
  });
  save(note);

  return note.toJSON();
}



export const DroppedElReplacer = {
  taskDropOnTask,
  groupDropOnTask,
  taskDropOnGroup, 
  groupDropOnGroup,
}