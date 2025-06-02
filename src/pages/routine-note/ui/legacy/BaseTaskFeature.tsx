/** @jsxImportSource @emotion/react */
import { Checkable, RoutineNote, Task } from '@/entities/note';
import { Touchable } from '@/shared/components/Touchable';
import { doConfirm } from '@/shared/components/modal/confirm-modal';
import { SETTINGS } from '@/shared/settings';
import { dr } from '@/shared/utils/daily-routine-bem';
import { isMobile } from '@/shared/utils/plugin-service-locator';
import { css } from '@emotion/react';
import { ButtonBase } from '@mui/material';
import { Menu } from 'obsidian';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CancelLineName } from '../../../../features/checkable/ui/CancelLineName';
import { Checkbox } from '../../../../features/checkable/ui/Checkbox';
import { baseHeaderStyle, dragReadyStyle, draggingStyle, elementHeight, pressedStyle } from '../../../../features/checkable/ui/checkable-ui-config';
import { checkCheckable } from '../../../../widgets/note-routine-tree/model/check-checkable';
import { useRoutineNoteStore } from '../../../model/use-routine-note';
import { OptionIcon } from './OptionIcon';
import { DELAY_TOUCH_START } from './dnd/NoteDndContext';
import { useTaskDnd } from './dnd/use-task-dnd';


const indentStyle = css({
  borderLeft: "1px solid var(--color-base-30)",
  margin: "0 0 0 13px",
  paddingLeft: "9px",
})

const bem = dr("task");

type TaskMode = "idle" | "pressed" | "drag-ready" | "dragging";

interface BaseCheckableProps<T extends Checkable> {
  checkable: T;
  parent: TaskGroup | null;
  onOptionMenu: (m: Menu, task: T) => void | Promise<void>;

  className?: string;
  onTaskReorder?: (note: RoutineNote, task: T) => void;
  onStateChange?: (task: T) => void;
}
export const BaseTaskFeature = React.memo(<T extends Task>({
  checkable,
  parent,
  className,
  onTaskReorder,
  onOptionMenu,
  onStateChange
}: BaseCheckableProps<T>) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [taskMode, setTaskMode] = useState<TaskMode>("idle");
  const { setNote, note } = useRoutineNoteStore();


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
    canDrag: isMobile() ? taskMode === "drag-ready" : true,
    onElDragEnd,
    onElDrop,
  });


  // isDragging sync
  useEffect(() => {
    if (_isDragging) {
      setTaskMode("dragging");
    } else {
      setTaskMode("idle");
    }
  }, [_isDragging])


  const onPressChange = useCallback((isPressed: boolean) => {
    if (isPressed && taskMode !== "pressed") {
      setTaskMode("pressed");
    } else if (!isPressed && taskMode !== "dragging") {
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
    if (disableTouch.current) return;
    disableTouch.current = true;
    // HACK: 이유는 모르겠지만 이거 안하면 모바일 환경에서 모달이 열리자마다 닫혀버림.
    e.preventDefault();

    const destState: TaskState = checkable.state === "un-checked" ? "accomplished" : "un-checked";
    let doUncheck = true;
    if (SETTINGS.getConfirmUncheckTask() && checkable.state !== "un-checked") {
      doUncheck = await doConfirm({
        title: "UnCheck Task",
        description: "Are you sure you want to uncheck this task?",
        confirmText: "UnCheck",
        confirmBtnVariant: "accent",
      })
    }
    if (doUncheck) {
      const newNote = await checkCheckable(note, checkable.name, destState);
      setNote(newNote);
      if (onStateChange) onStateChange({ ...checkable, checked: destState });
    }

    // HACK: 빠르게 인접한 task를 클릭하면 클릭히 씹히거나 두번 클릭되는 문제가 있어서, 일단 0.5초 정도 막아둠으로 해결
    setTimeout(() => {
      disableTouch.current = false;
    }, 500);
  }, [note, onStateChange, setNote, checkable])


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
      <ButtonBase
        LinkComponent={"div"}
        href='#'
        color='primary'
        css={{
          ".MuiTouchRipple-child": {
            backgroundColor: "var(--color-accent-1) !important",
          },
          width: "100%",
        }}
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
          <Checkbox
            state={checkable.state}
            size={13}
            css={{
              marginRight: "0.5em",
            }}
          />
          <CancelLineName name={checkable.name} cancel={checkable.state !== "un-checked"} />
        </Touchable>
      </ButtonBase>
      <OptionIcon onOptionMenu={(m) => onOptionMenu(m, checkable)} />
      {indicator}
    </div>
  )
})