import { isNoteRoutineGroup, mergeRoutineMutations, NoteRoutine, NoteRoutineGroup, NoteRoutineLike, noteService, RoutineBuilder, RoutineTree, routineTreeService } from "@/entities/note";
import { Routine, RoutineGroup, routineGroupService, RoutineLike, routineService, UNGROUPED_GROUP_NAME } from "@/entities/routine-like";
import { DndCase } from "@/shared/dnd/dnd-case";
import { ORDER_OFFSET } from "../config";
import { RoutineDndItem } from "./dnd-item";



export type RelocateRoutinesArgs = {
  active: RoutineDndItem;
  over: RoutineDndItem;
  dndCase: DndCase;
}


/**
 * routine들의 위치를 이동시키고, 저장한다.
 * 이를 기반으로 새롭게 routineTree를 빌드하여 반환한다.
 */
export const relocateRoutines = async (tree: RoutineTree, { active, over, dndCase }: RelocateRoutinesArgs): Promise<RoutineTree> => {
  const relocator = new RoutineOrderUpdater(tree, dndCase);

  if (active.nrlType === "routine-group") {
    // 1. group이 다른 group 위로
    if (over.nrlType === "routine-group") {
      await relocator.groupOnGroup(active.routineGroup, over.routineGroup);
    }
    // 2. group이 routine 위로
    else {
      await relocator.groupOnRoutine(active.routineGroup, over.routine);
    }
  }
  else {
    // 3. routine이 group 위로
    if (over.nrlType === "routine-group") {
      await relocator.routineOnGroup(active.routine, over.routineGroup);
    }
    // 4. routine이 다른 routine 위로
    else {
      await relocator.routineOnRoutine(active.routine, over.routine);
    }
  }

  // === routine 변경사항 반영 ===
  await mergeRoutineMutations();

  let newTree: RoutineTree;
  const newNote = await noteService.load(tree.day);
  if (newNote) {
    newTree = newNote.routienTree;
  } else {
    const routineBuilder = await RoutineBuilder.withDiskAsync();
    newTree = routineBuilder.build(tree.day);
  }
  return newTree;
}


class RoutineOrderUpdater {
  constructor(
    private tree: RoutineTree,
    private dndCase: DndCase,
  ) { }

  async groupOnGroup(active: NoteRoutineGroup, over: NoteRoutineGroup): Promise<RoutineTree> {
    let beforeAndAfter: { before: RoutineLike | null, after: RoutineLike | null } = { before: null, after: null };
    switch (this.dndCase) {
      case "insert-before":
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "before");
        break;
      case "insert-after":
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "after");
        break;
      case "insert-into-first":
      case "insert-into-last":
        throw new Error("Cannot move group to another group.");
    }
    const { before, after } = beforeAndAfter;
    const newOrder = await this.ensureNewOrder(
      before?.properties.order ?? Number.MIN_SAFE_INTEGER,
      after?.properties.order ?? Number.MAX_SAFE_INTEGER
    );
    const activeGroup = await routineGroupService.load(active.name);
    activeGroup.properties.order = newOrder;
    await routineGroupService.update(activeGroup);
    return this.tree;
  }

  async groupOnRoutine(active: NoteRoutineGroup, over: NoteRoutine): Promise<RoutineTree> {
    let beforeAndAfter: { before: RoutineLike | null, after: RoutineLike | null } = { before: null, after: null };
    switch (this.dndCase) {
      case "insert-before":
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "before");
        break;
      case "insert-after":
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "after");
        break;
      case "insert-into-first":
      case "insert-into-last":
        throw new Error("Cannot move group to another group.");
    }
    const { before, after } = beforeAndAfter;
    const newOrder = await this.ensureNewOrder(
      before?.properties.order ?? Number.MIN_SAFE_INTEGER,
      after?.properties.order ?? Number.MAX_SAFE_INTEGER
    );
    const activeGroup = await routineGroupService.load(active.name);
    activeGroup.properties.order = newOrder;
    await routineGroupService.update(activeGroup);
    return this.tree;
  }

  async routineOnGroup(active: NoteRoutine, over: NoteRoutineGroup): Promise<RoutineTree> {
    let beforeAndAfter: { before: RoutineLike | null, after: RoutineLike | null } = { before: null, after: null };
    let newGroup: string;
    switch (this.dndCase) {
      case "insert-before":
        newGroup = UNGROUPED_GROUP_NAME;
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "before");
        break;
      case "insert-after":
        newGroup = UNGROUPED_GROUP_NAME;
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "after");
        break;
      case "insert-into-first": {
        newGroup = over.name;
        const firstChild = over.routines[0] ?? null;
        beforeAndAfter = firstChild ? await this.getWithBeforeAndAfter(firstChild, "before") : { before: null, after: null };
        break;
      }
      case "insert-into-last": {
        newGroup = over.name;
        const lastChild = over.routines[over.routines.length - 1] ?? null;
        beforeAndAfter = lastChild ? await this.getWithBeforeAndAfter(lastChild, "after") : { before: null, after: null };
        break;
      }
    }
    const { before, after } = beforeAndAfter;
    const newOrder = await this.ensureNewOrder(
      before?.properties.order ?? Number.MIN_SAFE_INTEGER,
      after?.properties.order ?? Number.MAX_SAFE_INTEGER
    );
    const activeRoutine = await routineService.load(active.name);
    activeRoutine.properties.order = newOrder;
    activeRoutine.properties.group = newGroup;
    await routineService.update(activeRoutine);
    return this.tree;
  }

  async routineOnRoutine(active: NoteRoutine, over: NoteRoutine): Promise<RoutineTree> {
    let beforeAndAfter: { before: RoutineLike | null, after: RoutineLike | null } = { before: null, after: null };
    switch (this.dndCase) {
      case "insert-before":
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "before");
        break;
      case "insert-after":
        beforeAndAfter = await this.getWithBeforeAndAfter(over, "after");
        break;
      case "insert-into-first":
      case "insert-into-last":
        throw new Error("Cannot move routine to another routine.");
    }
    const { before, after } = beforeAndAfter;
    const newOrder = await this.ensureNewOrder(
      before?.properties.order ?? Number.MIN_SAFE_INTEGER,
      after?.properties.order ?? Number.MAX_SAFE_INTEGER
    );
    const overRoutine = await routineService.load(over.name);
    const activeRoutine = await routineService.load(active.name);
    activeRoutine.properties.order = newOrder;
    activeRoutine.properties.group = overRoutine.properties.group;
    await routineService.update(activeRoutine);
    return this.tree;
  }

  private async loadRoutineLike(noteRoutineLike: NoteRoutineLike): Promise<RoutineLike> {
    if (isNoteRoutineGroup(noteRoutineLike)) {
      return await routineGroupService.load(noteRoutineLike.name);
    } else {
      return await routineService.load(noteRoutineLike.name);
    }
  }

  /**
   * 제공된 noteRoutineLike와 앞, 또는 뒤를 함께 로드한다.
   */
  private async getWithBeforeAndAfter(nrl: NoteRoutineLike, with_: "before" | "after"): Promise<{ before: RoutineLike | null, after: RoutineLike | null }> {
    const parent = routineTreeService.getParent(this.tree, nrl.name);
    const parentList = parent ? parent.routines : this.tree.root;
    const index = parentList.findIndex(r => r.name === nrl.name);
    if (index === -1) {
      throw new Error(`RoutineLike with name ${nrl.name} not found in the tree`);
    }
    let before: RoutineLike | null = null;
    let after: RoutineLike | null = null;
    if (with_ === "before") {
      if (index > 0) {
        before = await this.loadRoutineLike(parentList[index - 1]);
      }
      after = await this.loadRoutineLike(nrl);
    }
    else {
      before = await this.loadRoutineLike(nrl);
      if (index < parentList.length - 1) {
        after = await this.loadRoutineLike(parentList[index + 1]);
      }
    }
    return { before, after };
  }

  /**
   * 새로운 order를 구하고, 유효하지 않은 경우 resetTreeOrders를 호출한 이후에 다시 order를 구하여 반환한다.
   */
  private async ensureNewOrder(before: number, after: number): Promise<number> {
    if (!this.validateNewOrder(before, after)) {
      await this.resetTreeOrders();
    }
    return this.getNewOrder(before, after);
  }

  private getNewOrder(before: number, after: number): number {
    return before / 2 + after / 2;
  }

  /**
   * reset이 필요한지 검증함
   */
  private validateNewOrder(before: number, after: number): boolean {
    // 둘의 차가 2 이상인지
    const isDiffOverTwo = Math.abs(before - after) >= 2;

    // 두 값의 평균이 number의 범위에 있는지
    const average = this.getNewOrder(before, after);
    const isAverageInRange = average >= Number.MIN_SAFE_INTEGER && average <= Number.MAX_SAFE_INTEGER;
    return isDiffOverTwo && isAverageInRange;
  }

  /**
   * tree의 모든 routine, group의 order를 초기화한다.
   */
  private async resetTreeOrders(): Promise<void> {
    const resetSiblings = async (list: NoteRoutineLike[]) => {
      let newOrder = 0;
      for (const nrl of list) {
        const isGroup = isNoteRoutineGroup(nrl);
        const routineOrGroup = isGroup ? await routineGroupService.load(nrl.name) : await routineService.load(nrl.name);
        routineOrGroup.properties.order = newOrder;
        newOrder += ORDER_OFFSET;
        await (isGroup ? routineGroupService.update(routineOrGroup as RoutineGroup) : routineService.update(routineOrGroup as Routine));

        // group이라면 재귀
        if (isGroup) {
          await resetSiblings(nrl.routines);
        }
      }
    }
    // 재귀 시작
    await resetSiblings(this.tree.root);
  }
}