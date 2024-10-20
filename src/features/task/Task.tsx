/** @jsxImportSource @emotion/react */
import { routineNoteArchiver } from "entities/archive";
import { RoutineNote, Task as TaskEntity } from "entities/routine-note";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { useRoutineNoteState } from "./task-context";
import _, { DebouncedFunc } from "lodash";
import { DRAG_PRESS_DELAY } from "./constants";
import { useDragLayer } from 'react-dnd'
import { moment } from "obsidian";
import { dr } from "shared/daily-routine-bem";
import { css } from "@emotion/react";
import { BaseTask, BaseTaskProps } from "./BaseTask";



/**
 * idel: 아무것도 안하고 있는 상태
 * dragging: 드래그 중
 * ready: 드래그가 준비된 상태(일정시간 클릭해서 드래그 가능 상태가 된 경우)
 */
type DragState = {
  type: "idle" | "dragging" | "ready";
}


interface TaskProps<T extends TaskEntity> {
  className?: string;
  task: T;
  onOptionClick?: (task: T) => void; // Option 버튼 or context menu
  onTaskReorder?: (tasks: TaskEntity[]) => void;
  onTaskClick?: (task: T) => void;
}
export const Task = React.memo(<T extends TaskEntity>({ className, task, onTaskReorder, onOptionClick, onTaskClick }: TaskProps<T>) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [dragState, _setDragState] = useState<DragState>({type: "idle"});
  const checked = useMemo(() => task.checked, [task.checked]);
  const [ routineNote, setRoutineNote ] = useRoutineNoteState();

  const setDragState = useCallback((state: DragState) => {
    if(state.type === dragState.type) return;
    _setDragState(state);
  }, [dragState.type])



  // [DND
  const [{isDragging}, drag] = useDrag({
    type: "task",
    item(){
      setDragState({type: "dragging"});
      return {task};
    },
    end: (item, monitor) => {
    },
    previewOptions: {captureDraggingState: true},
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }, [task])

  const getHixArea = useCallback(({ y }: XYCoord): "top" | "bottom" | null => {
    if(!taskRef.current) return null;
    const dropElOffset = taskRef.current.getBoundingClientRect();
    const dropTargetHeight = dropElOffset.height;
    // 전체 task 높이 중에서 윗부분 n%, 아랫부분 n%에 hit한 경우 각각 topHix, bottomHix로 처리
    const hitBoundary = 0.35;
    const dropTargetAvailableHeightPerHixboxes = dropTargetHeight * hitBoundary;

    // RETURN
    if(y < dropElOffset.top + dropTargetAvailableHeightPerHixboxes) return "bottom";
    if(y > dropElOffset.bottom - dropTargetAvailableHeightPerHixboxes) return "top";
    return null;
  }, [])

  const replaceTask = useCallback((target: T, hit: "top" | "bottom"): RoutineNote => {
    return {
      ...routineNote,
      tasks: routineNote.tasks.reduce((acc, t) => {
        if(t.name === task.name && hit === "top"){
          acc.push(target);
        }
        if(t.name === target.name) return acc;
        acc.push(t);
        if(t.name === task.name && hit === "bottom"){
          acc.push(target);
        }
        return acc;
      }, [] as TaskEntity[])
    }
  }, [routineNote, task])

  const [ , drop ] = useDrop({
    accept: "task",
    hover(item, monitor) {
      // drag와 drop이 같은 task일 경우는 무시
      if(item.task.name === task.name) return;
      const xy = monitor.getClientOffset()??{x: -1, y: -1};
      const hit = getHixArea(xy);
      if(!hit) return;

      const newRoutineNote = replaceTask(item.task, hit);
      setRoutineNote(newRoutineNote);
    },
    drop: (item: {task: T}) => {
      /**
       * NOTE: 현재 이후의 노트인 경우에는 feature-note-updater에서 일괄적으로 처리함.
       * 다만, 과거의 노트인 경우는 now 이후의 노트에만 변경사항이 적용되기 때문에, 과거의 노트는 따로 저장 해줘야함.
       */
      if(routineNote.day.moment.isBefore(moment())){
        routineNoteArchiver.save(routineNote);
      }
      if(onTaskReorder) onTaskReorder(routineNote.tasks);
    }
  }, [task, routineNote, replaceTask, getHixArea, setRoutineNote])

  useEffect(() => {
    if(!taskRef.current) return;
    const el = taskRef.current;
    drag(el);
    drop(el);
  }, [drag, drop])
  // DND]



  const onClick = useCallback(() => {
    if(!taskRef.current) return;
    const cns = taskRef.current.classList;
    cns.toggle('dr-task--checked');
    const isChecked = cns.contains('dr-task--checked');
    if(onTaskClick) onTaskClick({
      ...task,
      checked: isChecked
    });
  }, [task, onTaskClick])

  const onLongPressEnd = useCallback(() => {
    if(dragState.type === "ready" && onOptionClick){
      onOptionClick(task);
    }
    setDragState({type: "idle"});
  }, [dragState.type, onOptionClick, setDragState, task])


  return (
    <BaseTask 
      ref={taskRef} 
      task={task}
      isDragging={isDragging}
      isReady={dragState.type === "ready"}
      onClick={onClick}
      longPressDelay={DRAG_PRESS_DELAY}
      onLongPressStart={() => setDragState({type: "ready"})}
      onLongPressEnd={onLongPressEnd}
      onOptionMenu={onOptionClick}
    />
  )
})



interface TaskPreviewProps {
  task: TaskEntity;
  style: React.CSSProperties;
}
export const TaskPreview = ({ task, style }: TaskPreviewProps) => {
  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getSourceClientOffset(),
  }));

  const getItemStyles = (style: React.CSSProperties) => {
    if (!currentOffset) {
      return { display: 'none' };
    }
    
    const { x, y } = currentOffset;
    const transform = `translate(${x - 45}px, ${y - 39}px)`;

    return {
      ...style,
      backgroundColor: "var(--background-primary)",
      boxShadow: "0 0 0.5em 0.5em rgba(0, 0, 0, 0.1)",
      transform,
      WebkitTransform: transform,
    };
  };


  return (
    <BaseTask
      task={task}
      style={getItemStyles(style)}
    />
  )
}