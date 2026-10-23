import { err, ok, Result } from "neverthrow";
import { isRoutineTask, isTask, isTaskGroup, NoteElement, RoutineNote, Task, TaskGroup, TaskParent } from "@entities/note/domain/note.type";
import { isRoutine, Routine, RoutineElement } from "@entities/routine/domain/routine-type";
import { RoutineGroupEntity } from "@entities/routine/domain/routine-group";
import { Day } from "@shared/period/day";


export type DropHit = "top" | "bottom" | "in";

/**
 * dnd에서 가능한 드롭: task/group을 task/group의 위(top)·아래(bottom)에, 또는 task를 group 안(in)에 놓는다.
 */
export type ElementDrop = {
  dropped: NoteElement;
  on: NoteElement;
  hit: DropHit;
}

export type MovedNote = {
  note: RoutineNote;
  // 드롭된 요소가 새로 들어간 부모(새 note 안의 객체). routine의 order·group은 이 부모를 기준으로 다시 계산한다.
  parent: TaskParent;
}

export type RoutineElementLookup = (name: string, type: RoutineElement["routineElementType"]) => RoutineElement | null;

const ORDER_OFFSET = 1000;


// task와 group은 같은 이름을 가질 수 있으므로, 이름과 타입을 함께 비교한다.
const isSameElement = (a: NoteElement, b: NoteElement): boolean => {
  return a.elementType === b.elementType && a.name === b.name;
}

/**
 * 드롭 결과를 반영한 새 note를 만든다. 원본 note와 그 group들은 바꾸지 않는다.
 * (store의 note를 제자리에서 바꾸면, 저장이 실패했을 때 화면과 파일이 어긋난다.)
 *
 * 드래그 도중 노트가 바뀌어(에디터에서 직접 수정 등) 대상이 사라졌을 수 있으므로, 찾지 못하면 err를 반환한다.
 */
const move = (note: RoutineNote, { dropped, on, hit }: ElementDrop): Result<MovedNote, string> => {
  if(isSameElement(dropped, on)) return err("cannot drop an element on itself");
  if(hit === "in" && !(on.elementType === "group" && dropped.elementType === "task")){
    return err("only a task can be dropped into a group");
  }

  // 드래그를 시작할 때의 복사본이 아니라, 지금 note에 있는 요소를 옮긴다.
  const target = findTopLevel(note.children, dropped) ?? findInGroups(note.children, dropped);
  if(!target) return err(`'${dropped.name}' is not in this note`);
  const children = removeElement(note.children, target);

  // on이 top-level 요소인 경우
  const onIdx = children.findIndex(el => isSameElement(el, on));
  if(onIdx !== -1){
    if(hit === "in"){
      const group = children[onIdx] as TaskGroup;
      const newGroup: TaskGroup = { ...group, children: [target as Task, ...group.children] };
      children[onIdx] = newGroup;
      return ok({ note: { ...note, children }, parent: newGroup });
    }
    children.splice(hit === "top" ? onIdx : onIdx + 1, 0, target);
    const newNote = { ...note, children };
    return ok({ note: newNote, parent: newNote });
  }

  // on이 group 안의 task인 경우
  if(on.elementType !== "task") return err(`'${on.name}' is not in this note`);
  const groupIdx = children.findIndex(el => isTaskGroup(el) && el.children.some(t => t.name === on.name));
  if(groupIdx === -1) return err(`'${on.name}' is not in this note`);
  // group 안에 group을 넣으면 계층이 깊어진다.
  if(!isTask(target)) return err("a group cannot be placed inside another group");

  const group = children[groupIdx] as TaskGroup;
  const tasks = [...group.children];
  const taskIdx = tasks.findIndex(t => t.name === on.name);
  tasks.splice(hit === "top" ? taskIdx : taskIdx + 1, 0, target);
  const newGroup: TaskGroup = { ...group, children: tasks };
  children[groupIdx] = newGroup;
  return ok({ note: { ...note, children }, parent: newGroup });
}


const findTopLevel = (children: NoteElement[], el: NoteElement): NoteElement | null => {
  return children.find(c => isSameElement(c, el)) ?? null;
}

const findInGroups = (children: NoteElement[], el: NoteElement): Task | null => {
  if(el.elementType !== "task") return null;
  for(const c of children){
    if(!isTaskGroup(c)) continue;
    const task = c.children.find(t => t.name === el.name);
    if(task) return task;
  }
  return null;
}

// target(note 안의 객체)을 뺀 새 children 배열을 만든다. target이 들어있던 group도 새 객체로 바꾼다.
const removeElement = (children: NoteElement[], target: NoteElement): NoteElement[] => {
  return children
  .filter(c => c !== target)
  .map(c => {
    if(isTaskGroup(c) && c.children.some(t => t === target)){
      return { ...c, children: c.children.filter(t => t !== target) };
    }
    return c;
  });
}


/**
 * 날짜 단위로 today보다 이전인지. (Day.today()는 현재 시각을 포함하므로 isBefore로 비교하면 오늘 노트도 과거가 된다.)
 */
const isPastDay = (day: Day, today: Day): boolean => {
  return day.wholeDayDiff(today) < 0;
}


type ResolveRoutineChangesArgs = {
  // 순서를 바꾼 노트의 날짜
  day: Day;
  today: Day;
  // 드롭된 요소가 들어간 부모(move의 결과)
  parent: TaskParent;
  lookup: RoutineElementLookup;
}

/**
 * parent의 자식 순서를 routine·routine-group 파일에 반영하려면 무엇을 바꿔야 하는지 계산한다. 실제로 바뀌는 것만 반환한다.
 *
 * 과거 노트는 그날의 기록일 뿐이므로 빈 목록을 반환한다.
 * 과거 노트의 배치를 routine에 반영하면, 그 뒤에 바꾼 routine의 group·순서가 옛 노트의 배치로 되돌아간다.
 */
const resolveRoutineChanges = ({ day, today, parent, lookup }: ResolveRoutineChangesArgs): RoutineElement[] => {
  if(isPastDay(day, today)) return [];

  // 지금은 존재하지 않는 group 안으로의 이동은 routine에 반영할 곳이 없다.
  if(isTaskGroup(parent) && !lookup(parent.name, "routine-group")) return [];
  const groupName = isTaskGroup(parent) ? parent.name : RoutineGroupEntity.UNGROUPED_NAME;

  const changes: RoutineElement[] = [];
  let prevOrder = 0;
  for(const el of parent.children){
    const found = lookupRoutineElement(el, lookup);
    if(!found) continue;

    // 앞 요소보다 order가 크면 그대로 두고, 아니면 앞 요소 뒤로 민다. (바뀌는 파일 수를 최소화)
    const order = found.properties.order > prevOrder ? found.properties.order : prevOrder + ORDER_OFFSET;
    prevOrder = order;

    if(isRoutine(found)){
      if(order !== found.properties.order || found.properties.group !== groupName){
        const changed: Routine = { ...found, properties: { ...found.properties, order, group: groupName } };
        changes.push(changed);
      }
    } else if(order !== found.properties.order){
      changes.push({ ...found, properties: { ...found.properties, order } });
    }
  }
  return changes;
}

// todo는 routine이 아니고, 그 사이 지워진 routine·group은 lookup에 없다.
const lookupRoutineElement = (el: NoteElement, lookup: RoutineElementLookup): RoutineElement | null => {
  if(isTaskGroup(el)) return lookup(el.name, "routine-group");
  if(isRoutineTask(el)) return lookup(el.name, "routine");
  return null;
}


export const ElementReorder = {
  move,
  isPastDay,
  resolveRoutineChanges,
}
