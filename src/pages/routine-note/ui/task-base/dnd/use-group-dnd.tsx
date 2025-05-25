/** @jsxImportSource @emotion/react */
import { useRoutineMutationMerge } from "@/entities/merge-note";
import { NoteElement, RoutineNote, Task, TaskGroup } from "@/entities/note";
import { useLeaf } from "@/shared/view/use-leaf";
import React, { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { DroppedElReplacer } from "../model/reorder-elements";
import { TaskElDragItem, TaskElDragItemType } from "./drag-item";
import { GroupHitArea, HitAreaEvaluator } from "./hit-area";
import { DndIndicator } from "./indicator";



interface UseGroupDndOption {
  group: TaskGroup;
  groupRef: RefObject<HTMLElement | null>; // 드래그 타겟
  isGroupOpen: boolean;
  canDrag: boolean;
  onElDragEnd?: () => void;
  onElDrop?: (updatedNote: RoutineNote, dropped: NoteElement) => void;
}
interface UseGroupDndResult {
  isDragging: boolean;
  indicator: React.ReactNode | null;
}
export const useGroupDnd = ({
  group,
  groupRef,
  isGroupOpen,
  canDrag,
  onElDragEnd,
  onElDrop
}: UseGroupDndOption): UseGroupDndResult => {
  const { mergeNotes } = useRoutineMutationMerge();
  const { view } = useLeaf();
  const [hit, setHit] = useState<GroupHitArea | null>(null);
  const indicator = useMemo<React.ReactNode | null>(() => {
    if (!hit) return null;
    return <DndIndicator mode={hit} />
  }, [hit])

  const [{ isDragging }, drag, preview] = useDrag({
    type: "GROUP" as TaskElDragItemType,

    canDrag: () => canDrag,

    item: () => ({
      el: group,
    } as TaskElDragItem),

    end: (item, monitor) => {
      onElDragEnd?.();
    },

    previewOptions: { captureDraggingState: false },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }, [group, canDrag, onElDragEnd])

  const evaluateHitArea = useCallback((dropped: NoteElement, monitor: DropTargetMonitor) => {
    if (dropped.name === group.name) return null;
    const coord = monitor.getClientOffset() ?? { x: -1, y: -1 };
    const isGroupCloseOrNoChildren = !isGroupOpen || group.children.length === 0;
    const isDroppedElTypeofGroup = dropped.elementType === "group";
    const hit = HitAreaEvaluator.evaluateGroup(coord, groupRef.current as HTMLElement, isGroupCloseOrNoChildren && !isDroppedElTypeofGroup);
    return hit;
  }, [group, groupRef, isGroupOpen])

  const [{ isOver }, drop] = useDrop({
    accept: ["TASK", "GROUP"],

    hover(item: TaskElDragItem, monitor) {
      const dropped = item.el;
      const hit = evaluateHitArea(dropped, monitor);
      if (!hit) return;
      setHit(hit);
    },

    drop: async (item, monitor) => {
      if (!hit) return;
      const dropped = item.el;
      let newNote: RoutineNote;
      if (dropped.elementType === "task") {
        newNote = await DroppedElReplacer.taskDropOnGroup({
          dropped: dropped as Task,
          on: group,
          hit,
        });
      } else {
        if (hit === "in") return null;
        newNote = await DroppedElReplacer.groupDropOnGroup({
          dropped: dropped as TaskGroup,
          on: group,
          hit,
        });
      }
      setHit(null);
      mergeNotes(newNote);
      onElDrop?.(newNote, dropped);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    })

  }, [group, hit, onElDrop, mergeNotes, evaluateHitArea])

  // hoverOut시에 indicator를 제거
  useEffect(() => {
    if (!isOver) {
      setHit(null);
    }
  }, [isOver])

  useEffect(() => {
    if (!groupRef.current) return;
    drag(groupRef.current);
    drop(groupRef.current);

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

  }, [drop, drag, groupRef, preview, group, view.containerEl])

  return {
    isDragging,
    indicator
  };
}