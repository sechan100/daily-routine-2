/** @jsxImportSource @emotion/react */
import { routineNoteArchiver, RoutineNote, Task as TaskEntity } from 'entities/note';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDrag, useDragDropManager, useDrop, XYCoord } from "react-dnd";
import { useRoutineNote } from "entities/note";
import _ from "lodash";
import { DRAG_PRESS_DELAY } from "./constants";
import { useDragLayer } from 'react-dnd'
import { moment } from "obsidian";
import { BaseTask } from "./BaseTask";
import { Touchable } from 'shared/components/Touchable';
import { DailyRoutineBEM, dr } from 'shared/daily-routine-bem';
import { DragState, TaskDndHandle } from './TaskDndHandle';



const Checkbox = ({ bem }: { bem: DailyRoutineBEM}) => {
  return (          
    <span
      className={bem("cbx")}
      css={{
        position: "relative",
        top: "calc(1/32 * 1em)",
        display: "inline-block",
        width: "calc(14/16 * 1em)",
        height: "calc(14/16 * 1em)",
        marginRight: "calc(0.5em)",
        border: "calc(1/16 * 1em) solid #c8ccd4",
        borderRadius: "3px",
        cursor: "pointer",
        // 체크표시 V
        "&:before": {
          content: "''",
          position: "absolute",
          top: "50%",
          left: "50%",
          margin: "calc(-5/8 * 1em) 0 0 calc(-5/8 * 1em)",
          width: "calc(5/4 * 1em)",
          height: "calc(5/4 * 1em)",
          borderRadius: "100%",
          background: "hsla(var(--color-accent-1-hsl), 1.0)",
          transform: "scale(0)",
        },
          
        // 체크 이펙트
        "&:after": {
          content: "''",
          position: "absolute",
          top: "calc(5/16 * 1em)",
          left: "calc(5/16 * 1em)",
          width: "calc(1/8 * 1em)",
          height: "calc(1/8 * 1em)",
          borderRadius: "2px",
          boxShadow: "0 calc(9/8 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * 1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), 0 calc(9/8 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * -1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0)",
          transform: "scale(0)",
        },
          
        // 체크된 경우
        ".dr-task--checked &": {
          borderColor: "transparent",
          "&:before": {
            transform: "scale(1)",
            opacity: "0",
            transition: "all 0.3s ease",
          },
          "&:after": {
            transform: "scale(1)",
            opacity: "0",
            transition: "all 0.6s ease",
          }
        }
      }}
    >
      <svg 
        viewBox="0 0 14 12"
        css={{
          position: "relative",
          width: "calc(7/8 * 1em)",
          height: "calc(3/4 * 1em)",
          top: "calc(-1/16 * 1em)",
          transform: "scale(0)",
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          ".dr-task--checked &": {
            transform: "scale(1)",
            transition: "all 0.4s ease",
            transitionDelay: "0.1s",
          }
        }}
      >
        <polyline 
          points="1 7.6 5 11 13 1"
          css={{
            strokeWidth: 2,
            stroke: "var(--color-accent-1)"
          }}
        />
      </svg>
    </span>
  )
}

const TaskName = ({ name, bem }: { name: string, bem: DailyRoutineBEM }) => {
  return (
    <span 
      className={bem("name")}
      css={{
        position: "relative",
        cursor: "pointer",
        transition: "color 0.3s ease",
        "&:after": {
          content: "''",
          position: "absolute",
          top: "50%",
          left: 0,
          width: 0,
          height: "1px",
          background: "#9098a9",
        },
        ".dr-task--checked &": {
          color: "#9098a9",
          "&:after": {
            width: "100%",
            transition: "all 0.4s ease",
          }
        }
      }}
    >
      {name}
    </span>
  )
}


interface TaskProps<T extends TaskEntity> {
  className?: string;

  /**
   * task 객체가 변경되어야 리렌더링이 된다.
   */
  task: T;

  /**
   * 옵션 버튼을 클릭, 또는 모바일에서 long press시에 호출
   */
  onOptionMenu: (task: T) => void;

  /**
   * task가 속한 note가 과거(어제, 또는 더 과거)인 경우에 note를 save해준다. 
   * 만약 미래의 노트인 경우 따로 해당 콜백에서 이벤트를 발행하여, feature-note-updater에게 처리를 위임할 필요가 있다.
   */
  onTaskReorder?: (tasks: TaskEntity[]) => void;

  /**
   * checked 상태는 내부적으로 변경해준다. 
   * 그 이후 처리가 필요한 경우 호출
   * @param task checked 상태가 변경된 task
   */
  onTaskClick?: (task: T) => void;
}
export const AbstractTask = React.memo(<T extends TaskEntity>({ className, task, onTaskReorder, onOptionMenu, onTaskClick }: TaskProps<T>) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [dragState, _setDragState] = useState<DragState>("idle");
  const checkTask = useRoutineNote(s=>s.checkTask);

  const setDragState = useCallback((state: DragState) => {
    if(state === dragState) return;
    _setDragState(state);
  }, [dragState])



  const onLongPressStart = useCallback((e: React.TouchEvent) => {
    setDragState("ready");
  }, [setDragState])

  const onLongPressEnd = useCallback((e: React.TouchEvent) => {
    if(dragState === "ready" && onOptionMenu){
      onOptionMenu(task);
    }
    setDragState("idle");
  }, [dragState, onOptionMenu, setDragState, task])

  const onClick = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    checkTask(task, !task.checked);
    if(onTaskClick) onTaskClick({
      ...task,
      checked: !task.checked
    });
  }, [checkTask, onTaskClick, task])



  const bem = useMemo(() => dr("task"), []);
  return (
    <div css={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <Touchable
        ref={taskRef}
        className={bem("", {
          "checked": task.checked,
          "ready": dragState === "ready",
          "dragging": dragState === "dragging",
        }, className)}
        longPressDelay={DRAG_PRESS_DELAY}
        onClick={onClick}
        onLongPressStart={onLongPressStart}
        onLongPressEnd={onLongPressEnd}
        css={{
          display: "block",
          fontSize: "16px",
          width: "100%",
          height: "2.5em",
          padding: "0 0 0 0.5em",
          margin: "0 0",
          cursor: "pointer",
          "&.dr-task--ready, &.dr-task--dragging": {
            position: "relative",
            "&::after": {
              content: "''",
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              borderRadius: "5px",
              backgroundColor: "hsla(var(--color-accent-1-hsl), 0.5)",
            }
          }
        }}
      >
        <div 
          className={bem("container")}
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div 
            className={bem("main")}
            css={{
              display: "flex",
              alignItems: "center",
              lineHeight: 1,
            }}
          >
            <Checkbox bem={bem} />
            <TaskName bem={bem} name={task.name} />
          </div>
        </div>
      </Touchable>
      <TaskDndHandle task={task} dragState={dragState} onDragStateChange={setDragState}/>
    </div>
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