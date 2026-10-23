/** @jsxImportSource @emotion/react */
import { RoutineNote, NoteElement, TaskGroup } from "@entities/note";
import { useLeaf } from "@shared/view/use-leaf";
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { TaskElDragItem, TaskElDragItemType } from "./drag-item";
import { GroupHitArea, HitAreaEvaluator } from "./hit-area";
import { DndIndicator } from "./indicator";
import { useReorderDrop } from "./use-reorder-drop";



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
  const applyDrop = useReorderDrop();
  const { view } = useLeaf();
  const [hit, setHit] = useState<GroupHitArea | null>(null);
  // drop은 마지막 hover 직후, 다시 렌더되기 전에 올 수 있으므로 최신 hit은 ref로 읽는다.
  const hitRef = useRef<GroupHitArea | null>(null);
  const updateHit = useCallback((newHit: GroupHitArea | null) => {
    hitRef.current = newHit;
    setHit(newHit);
  }, [])

  const indicator = useMemo<React.ReactNode | null>(() => {
    if(!hit) return null;
    return <DndIndicator mode={hit} />
  }, [hit])

  const [{ isDragging }, drag, preview] = useDrag({
    type: "GROUP" as TaskElDragItemType,

    canDrag: () => canDrag,

    item: () => ({
      el: group,
    }),

    end: () => {
      onElDragEnd?.();
    },

    previewOptions: { captureDraggingState: false },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }, [group, canDrag, onElDragEnd])

  const evaluateHitArea = useCallback((dropped: NoteElement, monitor: DropTargetMonitor) => {
    if(dropped.elementType === "group" && dropped.name === group.name) return null;
    const node = groupRef.current;
    const coord = monitor.getClientOffset();
    if(!node || !coord) return null;
    // 닫혀 있거나 비어 있으면 header가 group 전체이므로, 안(in)과 아래(bottom)에 놓을 수 있다.
    const isHeaderWholeGroup = !isGroupOpen || group.children.length === 0;
    return HitAreaEvaluator.evaluateGroup(coord.y, node.getBoundingClientRect(), {
      // group 안에 group을 넣으면 계층이 깊어진다.
      allowIn: isHeaderWholeGroup && dropped.elementType === "task",
      allowBottom: isHeaderWholeGroup,
    });
  }, [group, groupRef, isGroupOpen])

  const [{ isOver }, drop ] = useDrop({
    accept: ["TASK", "GROUP"],

    hover(item: TaskElDragItem, monitor) {
      const newHit = evaluateHitArea(item.el, monitor);
      // 판정할 수 없는 영역(null)에서는 직전 hit을 유지한다.
      if(newHit && newHit !== hitRef.current){
        updateHit(newHit);
      }
    },

    drop: (item) => {
      const dropHit = hitRef.current;
      updateHit(null);
      if(!dropHit) return;
      const dropped = item.el;
      void applyDrop({ dropped, on: group, hit: dropHit }).then(newNote => {
        if(newNote) onElDrop?.(newNote, dropped);
      });
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    })

  }, [group, applyDrop, onElDrop, evaluateHitArea, updateHit])

  // hoverOut시에 indicator를 제거
  useEffect(() => {
    if(!isOver) {
      updateHit(null);
    }
  }, [isOver, updateHit])

  useEffect(() => {
    if(!groupRef.current) return;
    drag(groupRef.current);
    drop(groupRef.current);

    /**
     * HACK: 유지보수를 위해서 preview 로직을 backend 종류(html5, touch)에 관계없이 동일하게 처리하기 위해서, html5 backend에서 제공하는 기본 preview를 없애고 있었다.
     * 이 때, preview의 크기를 아예 없애거나 보이지 않도록 조치를 취하면, 이상한 지구본 모양의 아이콘이 어디선가 나타나는 기현상이 계속해서 발생함.
     * 그래서 그냥 html5인 경우에 preview를 최대한 안보이게 찌끄맣게 만들어서 할당해둠.
     * 실제 모든 preveiw에 관한 처리는 TaskPreview 컴포넌트에서 처리함.
     */
    let pseudoPreview = document.querySelector("#dr-pseudo-preview");
    if(!pseudoPreview){
      const div = createDiv();
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