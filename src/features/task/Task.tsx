import { RoutineNote, Task as TaskEntity } from "entities/routine-note";
////////////////////////////
import React, { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx";
import "./task.scss";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { useRoutineNoteState } from "./task-context";
import _, { DebouncedFunc } from "lodash";
import { routineNoteArchiver } from "entities/archive";
import { routineManager } from "entities/routine/routine";
import { DRAG_PRESS_DELAY } from "./constants";
import { useDragLayer } from 'react-dnd'



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

  /**
   * Option 버튼 or context menu
   */
  onOptionClick?: (task: T) => void;

  onTaskClick?: (task: T) => void;
}
export const Task = <T extends TaskEntity>({ className, task, onOptionClick: onOptionClick_props, onTaskClick }: TaskProps<T>) => {
  // 루틴 체크와 클릭 ///////////////////////////////////////////////////////////////////////
  const [checked, setChecked] = useState(task.checked);

  // props의 task.checked를 내부 상태와 동기화
  useEffect(() => {
    setChecked(task.checked)
  }, [task.checked])
  
  // 루틴 클릭시 콜백함수
  const onClick = useCallback((e: React.MouseEvent) => {
    if(!taskRef.current) return;
    // 먼저 클래스 toggle
    const cns = taskRef.current.classList;
    cns.toggle('dr-task--checked');
    const isChecked = cns.contains('dr-task--checked');

    // 상태 업데이트
    setChecked(isChecked)

    // props callback 호출
    if(onTaskClick) onTaskClick({
      ...task,
      checked: isChecked
    });
  }, [task, onTaskClick])

  ///////////////////////////////////////////////////////////////////////////
  // option 클릭시 콜백함수
  const onOptionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if(onOptionClick_props){
      onOptionClick_props(task);
    }
  }, [task, onOptionClick_props])


  // taskRef ///////////////////////////////////////////////////////////////
  const taskRef = useRef<HTMLDivElement>(null);


  // DND ////////////////////////////////////////////////////////
  
  const [dragState, setDragState] = useState<DragState>({type: "idle"});
  const [ routineNote, setRoutineNote ] = useRoutineNoteState();

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
      routineNoteArchiver.save(routineNote);
      routineManager.reorder(routineNote.tasks.filter(t => t.type === "routine").map(r => r.name));
    }
  }, [task, routineNote, replaceTask, getHixArea, setRoutineNote])


  /**
   * taskRef에 dragSource, dropSource를 할당. touchstart, touchend 이벤트를 통해 일정시간 클릭시 드래그 가능 상태로 전환
   */
  useEffect(() => {
    if(!taskRef.current) return;

    const el = taskRef.current;
    // dnd 할당
    drag(el);
    drop(el);
  }, [drag, drop])

  const touchDebounce = useRef<DebouncedFunc<() => void>>(
    _.debounce(() => {
      setDragState({type: "ready"});
    }, DRAG_PRESS_DELAY)
  );
  // touchstart, touchend 이벤트를 통해 dragState 변경
  const touchStart = useCallback(() => {
    touchDebounce.current()
  }, [])
  
  const touchEnd = useCallback(() => {
    touchDebounce.current.cancel();

    /**
     * NOTE: 모바일에서 touchstart 발생 이후에 500ms 이후 dragState가 ready로 변경된다. 
     * 이 때, 드래그를 시작하면 상태가 dragging으로, 드래그를 하지 않고 바로 touchend가 발생하면 해당 함수가 호출된다. 이 때 상태는 ready이다.
     * 이를 이용하여 해당 함수가 호출된 시점에 dragState가 ready일 경우, option 메뉴를 띄운다.
     * 
     * 해당 로직은 모바일에서 contextMenu modal이 두번 호출되는 버그를 해결하기 위한 핵이다. 
     * 비슷한 버그: https://forum.obsidian.md/t/hold-tap-on-the-note-or-folder-opens-bottom-menu-twice/58572
     */
    if(dragState.type === "ready" && onOptionClick_props){
      onOptionClick_props(task);
    }
    setDragState({type: "idle"});
  }, [dragState.type, onOptionClick_props, task])


  return (
    <div
      ref={taskRef}
      className={clsx("dr-task", className, {
        // checked
        "dr-task--checked": checked,
        // dnd
        "dr-task--ready": dragState.type === "ready",
        "dr-task--dragging": isDragging
      })}
      onClick={onClick}
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onTouchCancel={touchEnd}
    >
      <div className="dr-task__container">
        {/* MAIN */}
        <div className="dr-task__main">
          <span className="dr-task__cbx">
              <svg viewBox="0 0 14 12">
                <polyline points="1 7.6 5 11 13 1"></polyline>
              </svg>
            </span>
          <span className="dr-task__name">{task.name}</span>
        </div>
        {/* 옵션 */}
        <div
          className="dr-task__option" 
          onClick={onOptionClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            strokeWidth={1.5} 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </div>
      </div>
    </div>
  )
}



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
    <div 
      className={clsx("dr-task", "dr-task-preview", { "dr-task--checked": task.checked })} 
      style={getItemStyles(style)}
    >
      <div className="dr-task__container">
        {/* MAIN */}
        <div className="dr-task__main">
          <span className="dr-task__cbx">
              <svg viewBox="0 0 14 12">
                <polyline points="1 7.6 5 11 13 1"></polyline>
              </svg>
            </span>
          <span className="dr-task__name">{task.name}</span>
        </div>
        {/* 옵션 */}
        <div className="dr-task__option">
          <svg
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            strokeWidth={1.5} 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </div>
      </div>
    </div>
  )
}