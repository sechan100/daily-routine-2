/** @jsxImportSource @emotion/react */
import { useRoutineMutationMerge } from "@/entities/merge-note";
import { NoteElement, RoutineNote, Task, TaskGroup } from "@/entities/note";
import { useLeaf } from "@/shared/view/use-leaf";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { useRoutineNoteStore } from '../../../model/use-routine-note';
import { DroppedElReplacer } from "../model/reorder-elements";
import { TaskElDragItem, TaskElDragItemType } from "./drag-item";
import { HitAreaEvaluator, TaskHitArea } from "./hit-area";
import { DndIndicator } from "./indicator";


interface UseTaskDndOption {
  task: Task;
  group: TaskGroup | null;
  taskRef: RefObject<HTMLElement | null>; // 드래그 타겟
  canDrag: boolean;
  onElDragEnd?: () => void;
  onElDrop?: (updatedNote: RoutineNote, dropped: NoteElement) => void;
}
interface UseTaksDndResult {
  isDragging: boolean;
  indicator: React.ReactNode | null;
}
export const useTaskDnd = ({
  task,
  group,
  taskRef,
  canDrag,
  onElDragEnd,
  onElDrop,
}: UseTaskDndOption): UseTaksDndResult => {
  const { mergeNotes } = useRoutineMutationMerge();
  const { view } = useLeaf();
  const [hit, setHit] = useState<TaskHitArea | null>(null);
  const indicator = useMemo<React.ReactNode | null>(() => {
    if (!hit) return null;
    return <DndIndicator mode={hit} />
  }, [hit])

  const isLastNode = useMemo(() => {
    if (!group) return false;
    const note = useRoutineNoteStore.getState().note;
    const lastGroup = (() => {
      const groupOrTask = note.children[note.children.length - 1];
      if (groupOrTask.elementType === "group") {
        return groupOrTask as TaskGroup;
      } else {
        return null;
      }
    })();

    if (lastGroup) {
      return lastGroup.children[lastGroup.children.length - 1].name === task.name;
    } else {
      return false;
    }
  }, [group, task.name])

  const [{ isDragging }, drag, preview] = useDrag({
    type: "TASK" as TaskElDragItemType,

    canDrag: () => canDrag,

    item: () => ({
      el: task,
    } as TaskElDragItem),

    end: (item, monitor) => {
      onElDragEnd?.();
    },

    previewOptions: { captureDraggingState: false },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }, [task, canDrag, onElDragEnd])

  const evaluateHitArea = useCallback((dropped: NoteElement, monitor: DropTargetMonitor) => {
    if (dropped.name === task.name) return null;
    const coord = monitor.getClientOffset() ?? { x: -1, y: -1 };
    const hit = HitAreaEvaluator.evaluateTask(coord, taskRef.current as HTMLElement, isLastNode);
    return hit;
  }, [task, taskRef, isLastNode])

  const [{ isOver }, drop] = useDrop({
    // 이미 그룹에 속한 task가 또 그룹을 받으면 계층이 깊어짐
    accept: group ? "TASK" : ["TASK", "GROUP"],

    hover(item: TaskElDragItem, monitor) {
      const dropped = item.el;
      const newHit = evaluateHitArea(dropped, monitor);
      if (!newHit) return;
      if (newHit !== hit) {
        setHit(newHit);
      }
    },

    drop: async (item, monitor) => {
      if (!hit) return;
      const dropped = item.el;
      let newNote: RoutineNote;
      if (dropped.elementType === "task") {
        newNote = await DroppedElReplacer.taskDropOnTask({
          dropped: dropped as Task,
          on: task,
          hit
        });
      } else {
        newNote = await DroppedElReplacer.groupDropOnTask({
          dropped: dropped as TaskGroup,
          on: task,
          hit
        });
      }
      setHit(null);
      mergeNotes(newNote);
      onElDrop?.(newNote, dropped);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    })

  }, [task, mergeNotes, group, onElDrop, evaluateHitArea, hit])

  // hoverOut시에 hit을 초기화
  useEffect(() => {
    if (!isOver) {
      setHit(null);
    }
  }, [isOver])

  useEffect(() => {
    if (!taskRef.current) return;
    drag(taskRef.current);
    drop(taskRef.current);

    /**
     * HACK: 유지보수를 위해서 preview 로직을 backend 종류(html5, touch)에 관계없이 동일하게 처리하기 위해서, html5 backend에서 제공하는 기본 preview를 없애고 있었다.
     * 이 때, preview의 크기를 아예 없애거나 보이지 않도록 조치를 취하면, 이상한 지구본 모양의 아이콘이 어디선가 나타나는 기현상이 계속해서 발생함.
     * 그래서 그냥 html5인 경우에 preview를 최대한 안보이게 찌끄맣게 만들어서 할당해둠.
     * 실제 모든 preveiw에 관한 처리는 TaskPreview 컴포넌트에서 처리함.
     */
    let pseudoPreview = document.querySelector("#dr-pseudo-preview");
    if (!pseudoPreview) {
      const div = document.createElement("div");
      div.setCssStyles({
        backgroundColor: "red",
        width: "0.1px",
        height: "0.1px",
      })
      div.id = "dr-pseudo-preview";
      view.containerEl.appendChild(div);
      pseudoPreview = div;
    }
    preview(pseudoPreview);

  }, [drop, drag, taskRef, preview, task, view.containerEl])

  return {
    isDragging,
    indicator
  };
}