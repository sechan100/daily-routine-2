/** @jsxImportSource @emotion/react */
import { RoutineNote, Task, TaskGroup } from '@entities/note';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRoutineNote } from "@features/note";
import _ from "lodash";
import { Touchable } from '@shared/components/Touchable';
import { dr } from '@shared/daily-routine-bem';
import { Icon } from '@shared/components/Icon';
import { CheckableName } from './CheckableName';
import { Checkbox } from './Checkbox';
import { useTaskDnd } from '../dnd/use-task-dnd';
import { checkTask } from '../model/check-task';
import { OptionIcon } from './OptionIcon';
import { DELAY_TOUCH_START } from './dnd-context';
import { baseHeaderStyle, pressedStyle, dragReadyStyle, draggingStyle, elementHeight } from './base-element-style';
import { css } from '@emotion/react';


const indentStyle = css({
  borderLeft: "1px solid var(--color-base-30)",
  margin: "0 0 0 13px",
  paddingLeft: "9px",
})

const bem = dr("task");

type TaskMode = "idle" | "pressed" | "drag-ready" | "dragging";

interface TaskProps<T extends Task> {
  task: T;
  parent: TaskGroup | null;
  onOptionMenu: (task: T) => void;

  className?: string;
  onTaskReorder?: (note: RoutineNote, task: T) => void;
  onTaskClick?: (task: T) => void;
}
export const BaseTaskFeature = React.memo(<T extends Task>({ 
  task,
  parent,
  className,
  onTaskReorder,
  onOptionMenu,
  onTaskClick
}: TaskProps<T>) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [taskMode, setTaskMode] = useState<TaskMode>("idle");
  const { setNote, note } = useRoutineNote();

  const onElDrop = useCallback((newNote: RoutineNote, dropped: T) => {
    onTaskReorder?.(newNote, dropped);
  }, [onTaskReorder])

  const onElDragEnd = useCallback(() => {
    setTaskMode("idle");
  }, [])

  const { isDragging: _isDragging, indicator } = useTaskDnd({ 
    task,
    taskRef,
    group: parent,
    onElDragEnd,
    onElDrop,
  });

  // isDragging sync
  useEffect(() => {
    if(_isDragging){
      setTaskMode("dragging");
    }else{
      setTaskMode("idle");
    }
  }, [_isDragging])

  const onPressChange = useCallback((isPressed: boolean) => {
    if(isPressed && taskMode !== "pressed"){
      setTaskMode("pressed");
    } else if(!isPressed && taskMode !== "dragging"){
      setTaskMode("idle");
    }
  }, [taskMode])

  // 지정시간동안 press 하고나서
  const onAfterLongPressDelay = useCallback(() => {
    setTaskMode("drag-ready");
  }, [])


  // click
  const disableTouch = useRef<boolean>(false);
  const onClick = useCallback(async (e: React.TouchEvent | React.MouseEvent) => {
    if(disableTouch.current) return;
    disableTouch.current = true;
    // HACK: 이유는 모르겠지만 이거 안하면 모바일 환경에서 모달이 열리자마다 닫혀버림.
    e.preventDefault();

    const checked = !task.checked;
    const newNote = await checkTask(note, task.name, checked);
    setNote(newNote);
    if(onTaskClick) onTaskClick({ ...task, checked });

    // HACK: 빠르게 인접한 task를 클릭하면 클릭히 씹히거나 두번 클릭되는 문제가 있어서, 일단 0.5초 정도 막아둠으로 해결
    setTimeout(() => {
      disableTouch.current = false;
    }, 500);
  }, [note, onTaskClick, setNote, task])

  return (
    <div
      ref={taskRef}
      className={bem("", '', className)}
      css={[
        baseHeaderStyle, 
        taskMode === "pressed" && pressedStyle,
        taskMode === "drag-ready" && dragReadyStyle,
        taskMode === "dragging" && draggingStyle,
        parent !== null && indentStyle
      ]}
    >
      <Touchable
        onClick={onClick}
        longPressDelay={DELAY_TOUCH_START}
        onPressChange={onPressChange}
        onAfterLongPressDelay={onAfterLongPressDelay}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          width: "100%",
          height: elementHeight,
          padding: "0 0 0 0.5em",
          margin: "0 0",
          cursor: "pointer",
          lineHeight: 1
        }}
      >
        <Checkbox isChecked={task.checked} />
        <CheckableName name={task.name} isChecked={task.checked} />
      </Touchable>
      <OptionIcon onClick={() => onOptionMenu(task)} />
      {indicator}
    </div>
  )
})