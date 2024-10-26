/** @jsxImportSource @emotion/react */
import { Task as TaskEntity } from 'entities/note';
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useRoutineNote } from "entities/note";
import _ from "lodash";
import { DRAG_PRESS_DELAY } from "../constants";
import { Touchable } from 'shared/components/Touchable';
import { dr } from 'shared/daily-routine-bem';
import { DragState, TaskDndHandle } from './TaskDndHandle';
import { useDragLayer } from 'react-dnd';
import { Icon } from 'shared/components/Icon';
import { TaskName } from './TaskName';
import { Checkbox } from './Checkbox';
import { css } from '@emotion/react';


// [[ Styles
const taskReadyAndDraggingStyle = css({
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
})

const taskHeight = "2.5em";

// ]]





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
  const [dragState, setDragState] = useState<DragState>("idle");
  const checkTask = useRoutineNote(s=>s.checkTask);


  const onLongPressStart = useCallback((e: React.TouchEvent) => {
    setDragState("ready");
  }, [setDragState])

  const onLongPressEnd = useCallback((e: React.TouchEvent) => {
    if(dragState === "ready" && onOptionMenu){
      onOptionMenu(task);
    }
    console.log("long press end");
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
    <div 
      ref={taskRef}
      className={bem("", {
        "checked": task.checked,
        "ready": dragState === "ready",
        "dragging": dragState === "dragging",
      }, className)}
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "&.dr-task--ready, &.dr-task--dragging": taskReadyAndDraggingStyle
      }}
    >
      <Touchable
        longPressDelay={DRAG_PRESS_DELAY}
        onClick={onClick}
        onLongPressStart={onLongPressStart}
        onLongPressEnd={onLongPressEnd}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          width: "100%",
          height: taskHeight,
          padding: "0 0 0 0.5em",
          margin: "0 0",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        <Checkbox bem={bem} />
        <TaskName bem={bem} name={task.name} />
      </Touchable>
      <TaskDndHandle
        task={task}
        taskRef={taskRef}
        onDragStateChange={setDragState}
        css={{
          alignSelf: "stretch"
        }}
      />
    </div>
  )
})