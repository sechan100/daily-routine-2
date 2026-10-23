/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { RoutineNote, Task, TaskGroup, TaskState } from '@entities/note';
import { useRoutineNote } from "@features/note";
import { Touchable } from '@shared/components/Touchable';
import { dr } from '@shared/utils/daily-routine-bem';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTaskDnd } from '../dnd/use-task-dnd';
import { changeTaskState } from '../model/change-task-state';
import { CancelLineName } from './CancelLineName';
import { TaskCheckbox } from './TaskCheckbox';
import { OptionIcon } from './OptionIcon';
import { baseHeaderStyle, dragReadyStyle, draggingStyle, elementHeight, focusRingStyle, pressedStyle, rowRadius } from './base-element-style';
import { DELAY_TOUCH_START } from '../dnd/dnd-context';
import { Menu, Notice } from 'obsidian';
import { showMenu } from '@shared/components/Menu';
import { isMobile } from '@shared/utils/plugin-service-locator';
import { doConfirm } from '@shared/components/modal/confirm-modal';
import { DR_SETTING } from '@app/settings/setting-provider';
import { ButtonBase } from '@mui/material';
import { t } from '@shared/i18n';
import type { TouchRippleActions } from '@mui/material/ButtonBase';


const endSideRadius = {
  borderStartStartRadius: 0,
  borderEndStartRadius: 0,
  borderStartEndRadius: rowRadius,
  borderEndEndRadius: rowRadius,
};

// 안내선·들여쓰기는 논리 속성(inline-start)으로 그려서 오른쪽→왼쪽 언어(아랍어 등)에서는 오른쪽에 놓이게 한다.
const indentStyle = css({
  borderInlineStart: "1px solid var(--color-base-30)",
  margin: 0,
  marginInlineStart: "13px",
  paddingInlineStart: "9px",
  // 시작 쪽 안내선이 둥글게 말리지 않도록 끝 쪽 모서리만 둥글게
  ...endSideRadius,
})

const bem = dr("task");

type TaskMode = "idle" | "pressed" | "drag-ready" | "dragging";

interface TaskProps<T extends Task> {
  task: T;
  parent: TaskGroup | null;
  onOptionMenu: (m: Menu, task: T) => void | Promise<void>;

  className?: string;
  onTaskReorder?: (note: RoutineNote, task: T) => void;
  onStateChange?: (task: T) => void;
}
export const BaseTaskFeature = React.memo(<T extends Task>({ 
  task,
  parent,
  className,
  onTaskReorder,
  onOptionMenu,
  onStateChange
}: TaskProps<T>) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [taskMode, setTaskMode] = useState<TaskMode>("idle");
  const routineNote = useRoutineNote();
  const { note } = routineNote;


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


  // 우클릭(데스크톱)으로 "…" 아이콘과 같은 메뉴를 마우스 위치에 연다. 터치 long press는 Touchable이 drag-ready로 처리한다.
  const rippleRef = useRef<TouchRippleActions>(null);
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    // Touchable이 이벤트 전파를 막아 ButtonBase가 ripple을 못 끝내므로 직접 끝낸다.
    rippleRef.current?.stop(e);
    void showMenu((m) => onOptionMenu(m, task), { mouseEvent: e.nativeEvent });
  }, [onOptionMenu, task])


  // 상태 토글 (click / 키보드 공용)
  const disableTouch = useRef<boolean>(false);
  const toggleTask = useCallback(async () => {
    if(disableTouch.current) return;
    disableTouch.current = true;

    try {
      const destState: TaskState = task.state === "un-checked" ? "accomplished" : "un-checked";
      let doUncheck = true;
      if(DR_SETTING.confirmUncheckTask() && task.state !== "un-checked"){
         doUncheck = await doConfirm({
          title: t("tasks.task.uncheckTitle"),
          description: t("tasks.task.uncheckConfirm"),
          confirmText: t("tasks.task.uncheck"),
          confirmBtnVariant: "accent",
        })
      }
      if(doUncheck){
        const newNote = await changeTaskState(note, task.name, destState);
        routineNote.setNote(newNote);
        if(onStateChange) onStateChange({ ...task, checked: destState });
      }
    } catch(error) {
      console.error(error);
      new Notice(t("tasks.task.saveStateFailed"));
    } finally {
      // HACK: 빠르게 인접한 task를 클릭하면 클릭히 씹히거나 두번 클릭되는 문제가 있어서, 일단 0.5초 정도 막아둠으로 해결
      window.setTimeout(() => {
        disableTouch.current = false;
      }, 500);
    }
  }, [note, onStateChange, routineNote, task])

  const onClick = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // HACK: 이유는 모르겠지만 이거 안하면 모바일 환경에서 모달이 열리자마다 닫혀버림.
    e.preventDefault();
    void toggleTask();
  }, [toggleTask])

  // 키보드: 포커스된 행에서 Enter/Space. (마우스 click은 Touchable이 처리하므로 keydown만 받아 중복 호출이 없다)
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if(e.target !== e.currentTarget || e.repeat) return;
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      void toggleTask();
    }
  }, [toggleTask])


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
        component="div"
        role="checkbox"
        aria-checked={task.state !== "un-checked"}
        focusRipple={false}
        touchRippleRef={rippleRef}
        onKeyDown={onKeyDown}
        css={[
          {
            ".MuiTouchRipple-child": {
              backgroundColor: "var(--color-accent-1) !important",
            },
            width: "100%",
            minWidth: 0,
            ...(parent !== null ? endSideRadius : { borderRadius: rowRadius }),
            "@media (prefers-reduced-motion: reduce)": {
              ".MuiTouchRipple-root": {
                display: "none",
              },
            },
          },
          focusRingStyle,
        ]}
      >
        <Touchable
          onClick={onClick}
          onContextMenu={onContextMenu}
          longPressDelay={DELAY_TOUCH_START}
          onPressChange={onPressChange}
          onAfterLongPressDelay={onAfterLongPressDelay}
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            width: "100%",
            minWidth: 0,
            height: elementHeight,
            padding: 0,
            paddingInlineStart: "0.5em",
            margin: "0 0",
            cursor: "pointer",
            lineHeight: 1
          }}
        >
          <TaskCheckbox 
            state={task.state}
            size={13}
            css={{
              marginInlineEnd: "0.5em",
            }}
          />
          <CancelLineName name={task.name} cancel={task.state !== "un-checked"} />
        </Touchable>
      </ButtonBase>
      <OptionIcon label={t("tasks.task.options")} onOptionMenu={(m) => onOptionMenu(m, task)} />
      {indicator}
    </div>
  )
})