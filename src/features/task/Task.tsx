import { Task as TaskEntity } from "entities/routine-note";
////////////////////////////
import React, { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx";
import "./task.scss";
import { useDrag } from "react-dnd";


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
  onOptionClick?: (task: T) => void;
  onTaskClick?: (task: T) => void;
}
export const Task = <T extends TaskEntity>({ className, task, onOptionClick, onTaskClick }: TaskProps<T>) => {
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


  // taskRef ///////////////////////////////////////////////////////////////
  const taskRef = useRef<HTMLDivElement>(null);


  // DND ////////////////////////////////////////////////////////
  
  const [dragState, setDragState] = useState<DragState>({type: "idle"});

  const [{isDragging}, drag] = useDrag({
    type: "task",
    item(){
      setDragState({type: "dragging"});
      return {task};
    },
    end: (item, monitor) => {
      console.log('end');
      const dropResult = monitor.getDropResult();
      if(dropResult){
        console.log(dropResult);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })



  const touchTimeoutRef = useRef<NodeJS.Timeout | null>();
  /**
   * taskRef에 dragSource를 할당. touchstart, touchend 이벤트를 통해 일정시간 클릭시 드래그 가능 상태로 전환
   */
  useEffect(() => {
    if(!taskRef.current) return;

    const el = taskRef.current;
    // dnd 할당
    drag(el);

    // touchstart, touchend 이벤트를 통해 dragState 변경
    const touchStart = () => {
      touchTimeoutRef.current = setTimeout(() => {
        setDragState({type: "ready"});
      }, 500);
    }
    const touchEnd = () => {
      if(touchTimeoutRef.current){
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
      setDragState({type: "idle"});
    }
    
    // register and cleanup
    el.addEventListener('touchstart', touchStart);
    el.addEventListener('touchend', touchEnd);
    return () => {
      el.removeEventListener('touchstart', touchStart);
      el.removeEventListener('touchend', touchEnd);
    }
  }, [drag])





  return (
    <>
      <div
        ref={taskRef}
        className={clsx("dr-task", className, {
          // checked
          "dr-task--checked": checked,
          // dnd
          "dr-task--ready": dragState.type === "ready",
          "dr-task--dragging": isDragging
        })}
      >
        {/* MAIN */}
        <div className="dr-task__main" onClick={onClick}>
          <div className="dr-task__flex">
            <span className="dr-task__cbx">
                <svg viewBox="0 0 14 12">
                  <polyline points="1 7.6 5 11 13 1"></polyline>
                </svg>
              </span>
            <span className="dr-task__name">{task.name}</span>
          </div>
        </div>
        {/* 옵션 */}
        <div
          className="dr-task__option" 
          onClick={() => {if(onOptionClick) onOptionClick(task)}}
          // ref={dragHandleRef}
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
    </>
  )
}
