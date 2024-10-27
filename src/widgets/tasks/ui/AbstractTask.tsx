/** @jsxImportSource @emotion/react */
import { RoutineNote, routineNoteArchiver, routineNoteService, Task as TaskEntity } from 'entities/note';
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useRoutineNote } from "entities/note";
import _ from "lodash";
import { DRAG_PRESS_DELAY } from "../constants";
import { Touchable } from 'shared/components/Touchable';
import { dr } from 'shared/daily-routine-bem';
import { Icon } from 'shared/components/Icon';
import { TaskName } from './TaskName';
import { Checkbox } from './Checkbox';
import { css } from '@emotion/react';
import { useTaskDnd } from '../hooks/use-task-dnd';
import { moment } from 'obsidian';


// [[ Styles
const taskPressedAndDraggingStyle = css({
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
  const handleRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const { setNote, note } = useRoutineNote();

  const onTaskDrop = useCallback<(newNote: RoutineNote, droped: T) => void>((note, droped) => {
    // NOTE: 오늘 이후의 노트인경우 feature-note-updater가 처리함
    if(note.day.moment.isSameOrBefore(moment(), "day")){
      routineNoteArchiver.update(note, false);
    }
    onTaskReorder?.(note.tasks);
  }, [onTaskReorder])


  const { isDragging } = useTaskDnd({ task, taskRef, handleRef, onTaskDrop });


  const onLongPressStart = useCallback((e: React.TouchEvent) => {
  }, [])

  const onAfterLongPressDelay = useCallback(() => {
    if(onOptionMenu){
      onOptionMenu(task);
    }
  }, [onOptionMenu, task])

  const onLongPressEnd = useCallback((e: React.TouchEvent) => {

  }, [])
  
  // HACK: 빠르게 인접한 task를 클릭하면 클릭히 씹히거나 두번 클릭되는 문제가 있어서, 0.5초만 막아두면 적당하더라..
  const disableTouch = useRef<boolean>(false);
  const onClick = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if(disableTouch.current) return;
    disableTouch.current = true;

    const newNote = routineNoteService.checkTask(note, task, !task.checked);
    setNote(newNote);
    routineNoteArchiver.updateOrPersistOnUserConfirmation(newNote);

    if(onTaskClick) onTaskClick({
      ...task,
      checked: !task.checked
    });
    setTimeout(() => {
      disableTouch.current = false;
    }, 500);
  }, [note, onTaskClick, setNote, task])


  const bem = useMemo(() => dr("task"), []);
  return (
    <div 
      ref={taskRef}
      className={bem("", {
        "checked": task.checked,
        "pressed": isPressed,
        "dragging": isDragging,
      }, className)}
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "& *": {
          touchAction: "manipulation",
          userSelect: "none",
        },
        "&.dr-task--pressed, &.dr-task--dragging": taskPressedAndDraggingStyle
      }}
    >
      <Touchable
        onClick={onClick}
        longPressDelay={DRAG_PRESS_DELAY}
        onChangePressedState={setIsPressed}
        onLongPressStart={onLongPressStart}
        onAfterLongPressDelay={onAfterLongPressDelay}
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
          lineHeight: 1
        }}
      >
        <Checkbox bem={bem} />
        <TaskName bem={bem} name={task.name} />
      </Touchable>
      <div 
        ref={handleRef}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: "1",
          width: "3em",
          alignSelf: "stretch"
        }}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Icon icon="menu" />
      </div>
    </div>
  )
})