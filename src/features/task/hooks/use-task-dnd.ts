
/** @jsxImportSource @emotion/react */
import { RoutineNote, Task } from "@entities/note";
import { useRoutineNote } from "@features/note";
import { useRef, useCallback, useEffect, RefObject } from "react";
import { useDrag, XYCoord, useDrop } from "react-dnd";
import { useLeaf } from "@shared/view/react-view";



export interface DragItem {
  task: Task;
  previewSource: HTMLElement;
  width: number; // px
  dragHandleWidth: number; // px
}

interface UseTaskDndOption {
  task: Task;
  taskRef: RefObject<HTMLElement | null>; // 드롭 타겟
  handleRef: RefObject<HTMLElement | null>; // 드래그 핸들
  onTaskDrop?: (newNote: RoutineNote, droped: Task) => void;
}
interface UseTaskDndResult {
  isDragging: boolean;
}
export const useTaskDnd = ({ task, taskRef, handleRef, onTaskDrop }: UseTaskDndOption): UseTaskDndResult => {
  const setNote = useRoutineNote(s=>s.setNote);
  const { view } = useLeaf();
  const dragStartNoteSnapshot = useRef<RoutineNote | null>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "task",
    item(){
      dragStartNoteSnapshot.current = useRoutineNote.getState().note;
      const item: DragItem = {
        task,
        previewSource: taskRef.current as HTMLElement,
        width: taskRef.current?.clientWidth??0,
        dragHandleWidth: handleRef.current?.clientWidth??0,
      };
      return item;
    },
    end: (item, monitor) => {
    },
    previewOptions: {captureDraggingState: false},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }, [task])

  const getHixArea = useCallback(({ y }: XYCoord): "top" | "bottom" | null => {
    if(!handleRef.current) return null;
    const dropElOffset = handleRef.current.getBoundingClientRect();
    const dropTargetHeight = dropElOffset.height;
    // 전체 task 높이 중에서 윗부분 n%, 아랫부분 n%에 hit한 경우 각각 topHix, bottomHix로 처리
    const hitBoundary = 0.35;
    const dropTargetAvailableHeightPerHixboxes = dropTargetHeight * hitBoundary;

    // RETURN
    if(y < dropElOffset.top + dropTargetAvailableHeightPerHixboxes) return "bottom";
    if(y > dropElOffset.bottom - dropTargetAvailableHeightPerHixboxes) return "top";
    return null;
  }, [handleRef])

  const replaceTask = useCallback((target: Task, hit: "top" | "bottom"): RoutineNote => {
    const note = useRoutineNote.getState().note;
    return {
      ...note,
      tasks: note.tasks.reduce((acc, t) => {
        if(t.name === task.name && hit === "top"){
          acc.push(target);
        }
        if(t.name === target.name) return acc;
        acc.push(t);
        if(t.name === task.name && hit === "bottom"){
          acc.push(target);
        }
        return acc;
      }, [] as Task[])
    }
  }, [task])

  const [ , drop ] = useDrop({
    accept: "task",
    hover(item: DragItem, monitor) {
      if(item.task.name === task.name) return;
      const xy = monitor.getClientOffset()??{x: -1, y: -1};
      const hit = getHixArea(xy);
      if(!hit) return;

      const newRoutineNote = replaceTask(item.task, hit);
      setNote(newRoutineNote);
    },
    drop: async (item) => {
      const note = useRoutineNote.getState().note;
      if(dragStartNoteSnapshot.current === note) return;
      onTaskDrop?.(note, item.task);
    }
  }, [task, getHixArea, replaceTask, setNote])

  useEffect(() => {
    if(!handleRef.current || !taskRef.current) return;
    drag(handleRef.current);
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

  }, [handleRef, drop, drag, taskRef, preview, task, view.containerEl])
  
  return { 
    isDragging 
  };
}