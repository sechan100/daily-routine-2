
/** @jsxImportSource @emotion/react */
import { useRoutineNote, RoutineNote, Task } from "entities/note";
import { moment } from "obsidian";
import { useRef, useCallback, useEffect } from "react";
import { useDrag, XYCoord, useDrop } from "react-dnd";
import { drEvent } from "shared/event";
import { Icon } from "shared/components/Icon";
import React from "react";



/**
 * idel: 아무것도 안하고 있는 상태
 * dragging: 드래그 중
 * ready: 드래그가 준비된 상태(일정시간 클릭해서 드래그 가능 상태가 된 경우)
 */
export type DragState = "idle" | "dragging" | "ready";

interface TaskDndHandleProps {
  task: Task;
  dragState: DragState;
  onDragStateChange: (state: DragState) => void;
}
export const TaskDndHandle = React.memo(({ task, dragState, onDragStateChange }: TaskDndHandleProps) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const setNote = useRoutineNote(s=>s.setNote);
  const setNoteAndSave = useRoutineNote(s=>s.setNoteAndSave);

  const [{isDragging}, drag] = useDrag({
    type: "task",
    item(){
      console.log("drag start");
      onDragStateChange("dragging");
      return { task };
    },
    end: (item, monitor) => {
      console.log("drag end");
      onDragStateChange("idle");
    },
    previewOptions: {captureDraggingState: true},
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
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
  }, [])

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
    hover(item, monitor) {
      if(item.task.name === task.name) return;
      const xy = monitor.getClientOffset()??{x: -1, y: -1};
      const hit = getHixArea(xy);
      if(!hit) return;

      const newRoutineNote = replaceTask(item.task, hit);
      setNote(newRoutineNote);
    },
    drop: async (item: {task: Task}) => {
      const note = useRoutineNote.getState().note;
      /**
       * NOTE: 현재 이후의 노트인 경우에는 feature-note-updater에서 일괄적으로 처리함.
       * 다만, 과거의 노트인 경우는 now 이후의 노트에만 변경사항이 적용되기 때문에, 과거의 노트는 따로 저장 해줘야함.
       */
      if(note.day.moment.isBefore(moment())){
        setNoteAndSave(note);
      }
      drEvent.emit("reorderTasks", { 
        reordered: task,
        note,
      });
    }
  }, [task, getHixArea, replaceTask, setNote, setNoteAndSave])

  useEffect(() => {
    if(!handleRef.current) return;
    const el = handleRef.current;
    drag(el);
    drop(el);
  }, [handleRef, drop, drag])
  
  return (
    <div 
      ref={handleRef}
      onTouchStart={e => console.log("touch start")}
      onTouchCancel={e => console.log("touch cancel")}
      onTouchMove={e => console.log("touch move")}
      onTouchEnd={e => console.log("touch end")}
    >
      <Icon icon="menu" />
    </div>
  )
}); 