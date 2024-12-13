/** @jsxImportSource @emotion/react */
import { RoutineNoteDto, TaskDto, TaskElementDto, TaskGroupDto } from "@entities/note";
import { useRoutineNote } from "@features/note";
import { useLeaf } from "@shared/view/use-leaf";
import { RefObject, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { HitAreaEvaluator, TaskHitArea } from "./hit-area";
import { DndIndicator } from "./indicator";
import { DroppedElReplacer } from "../model/reorder-elements";
import { TaskElDragItem } from "./drag-item";


interface UseTaskDndOption {
  task: TaskDto;
  group: TaskGroupDto | null;
  taskRef: RefObject<HTMLElement | null>; // 드래그 타겟
  onElDragEnd?: () => void;
  onElDrop?: (updatedNote: RoutineNoteDto, dropped: TaskElementDto) => void;
}
interface UseTaksDndResult {
  isDragging: boolean;
  indicator: React.ReactNode | null;
}
export const useTaskDnd = ({ 
  task, 
  group, 
  taskRef, 
  onElDragEnd,
  onElDrop, 
}: UseTaskDndOption): UseTaksDndResult => {
  const setNote = useRoutineNote(s=>s.setNote);
  const { view } = useLeaf();
  const [hit, setHit] = useState<TaskHitArea | null>(null);
  const indicator = useMemo<React.ReactNode | null>(() => {
    if(!hit) return null;
    return <DndIndicator mode={hit} />
  }, [hit])

  const isLastNode = useMemo(() => {
    if(!group) return false;
    const note = useRoutineNote.getState().note;
    const lastGroup = (() => {
      const groupOrTask = note.root[note.root.length - 1];
      if(groupOrTask.elementType === "group"){
        return groupOrTask as TaskGroupDto;
      } else {
        return null;
      }
    })();

    if(lastGroup){
      return lastGroup.tasks[lastGroup.tasks.length - 1].name === task.name;
    } else {
      return false;
    }
  }, [group, task.name])

  const [{ isDragging }, drag, preview] = useDrag({
    type: "TASK",

    item: () => ({
      el: task,
    } as TaskElDragItem),

    end: (item, monitor) => {
      onElDragEnd?.();
    },

    previewOptions: {captureDraggingState: false},

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }, [task])

  const evaluateHitArea = useCallback((dropped: TaskElementDto, monitor: DropTargetMonitor) => {
    if(dropped.name === task.name) return null;
    const coord = monitor.getClientOffset()??{x: -1, y: -1};
    const hit = HitAreaEvaluator.evaluateTask(coord, taskRef.current as HTMLElement, isLastNode);
    return hit;
  }, [task, taskRef, isLastNode])

  const [{ isOver }, drop ] = useDrop({
    // 이미 그룹에 속한 task가 또 그룹을 받으면 계층이 깊어짐
    accept: group ? "TASK" : ["TASK", "GROUP"],

    hover(item: TaskElDragItem, monitor) {
      const dropped = item.el;
      const newHit = evaluateHitArea(dropped, monitor);
      if(!newHit) return;
      if(newHit !== hit){
        setHit(newHit);
      }
    },

    drop: async (item, monitor) => {
      if(!hit) return;
      const dropped = item.el;
      let newNote: RoutineNoteDto;
      if(dropped.elementType === "task") {
        newNote = DroppedElReplacer.taskDropOnTask({
          dropped: dropped as TaskDto,
          on: task,
          hit
        });
      } else {
        newNote = DroppedElReplacer.groupDropOnTask({
          dropped: dropped as TaskGroupDto,
          on: task,
          hit,
        }); 
      }
      setHit(null);
      setNote(newNote);
      onElDrop?.(newNote, dropped);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    })

  }, [task, setNote, group, onElDrop, evaluateHitArea, hit])

  // hoverOut시에 hit을 초기화
  useEffect(() => {
    if(!isOver) {
      setHit(null);
    }
  }, [isOver])

  useEffect(() => {
    if(!taskRef.current) return;
    drag(taskRef.current);
    drop(taskRef.current);

    /**
     * HACK: 유지보수를 위해서 preview 로직을 backend 종류(html5, touch)에 관계없이 동일하게 처리하기 위해서, html5 backend에서 제공하는 기본 preview를 없애고 있었다.
     * 이 때, preview의 크기를 아예 없애거나 보이지 않도록 조치를 취하면, 이상한 지구본 모양의 아이콘이 어디선가 나타나는 기현상이 계속해서 발생함.
     * 그래서 그냥 html5인 경우에 preview를 최대한 안보이게 찌끄맣게 만들어서 할당해둠.
     * 실제 모든 preveiw에 관한 처리는 TaskPreview 컴포넌트에서 처리함.
     */
    let pseudoPreview = document.querySelector("#dr-pseudo-preview");
    if(!pseudoPreview) {
      const div = document.createElement("div");
      div.setCssStyles({
        backgroundColor: "red",
        width: "0.01px",
        height: "0.01px",
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