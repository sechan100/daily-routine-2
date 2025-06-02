/** @jsxImportSource @emotion/react */
import { noteRepository, NoteRoutineGroupService, RoutineNote, TaskGroup } from '@/entities/note';
import { Icon } from '@/shared/components/Icon';
import { Touchable } from '@/shared/components/Touchable';
import { dr } from '@/shared/utils/daily-routine-bem';
import { isMobile } from '@/shared/utils/plugin-service-locator';
import { useLeaf } from '@/shared/view/use-leaf';
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from '@mui/material';
import { Menu } from 'obsidian';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CancelLineName } from '../../../../features/checkable/ui/CancelLineName';
import { baseHeaderStyle, draggingStyle, dragReadyStyle, elementHeight, pressedStyle } from '../../../../features/checkable/ui/checkable-ui-config';
import { useRoutineNoteStore } from '../../model/use-routine-note';
import { OptionIcon } from '../OptionIcon';
import { DELAY_TOUCH_START } from './NoteDndContext';
import { renderTask } from './render-task';
import { useGroupDnd } from './use-group-dnd';



const bem = dr("group");

type GroupMode = "idle" | "pressed" | "drag-ready" | "dragging";

interface Props {
  group: TaskGroup;
  onOptionMenu?: (m: Menu, group: TaskGroup) => void;
  className?: string;
  onGroupReorder?: (note: RoutineNote, group: TaskGroup) => void;
  onGroupClick?: (group: TaskGroup) => void;
}
export const BaseTaskGroupFeature = React.memo(({
  group,
  className,
  onGroupReorder,
  onOptionMenu,
  onGroupClick,
}: Props) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>("idle");
  const bgColor = useLeaf(s => s.leafBgColor);
  const { note, setNote } = useRoutineNoteStore();


  // dnd 시에 발생하는 일시적인 open/close를 위해서 따로 상태로 저장
  const [open, _setOpen] = useState(group.isOpen);

  useEffect(() => {
    _setOpen(group.isOpen);
  }, [group])

  // open 상태를 변경하는 함수. _setOpen은 일시적 상태변경이므로, 데이터 일관성을 위해서는 아래 함수를 사용할 것.
  const changeOpen = useCallback(async (isOpen: boolean) => {
    _setOpen(isOpen);
    const newNote = NoteRoutineGroupService.setGroupOpen(note, group.name, isOpen);
    setNote(newNote);
    await noteRepository.save(newNote);
  }, [group.name, note, setNote])


  /**
   * 모든 서브태스크가 체크되었을 때 그룹을 자동으로 닫아주는 기능을 구현
   */
  const isAllSubTasksChecked = group.children.length !== 0 && group.children.every(t => t.state !== "un-checked")
  const isAllSubTasksCheckedBeforeRef = useRef(isAllSubTasksChecked);
  useEffect(() => {
    if (!isAllSubTasksCheckedBeforeRef.current && isAllSubTasksChecked) {
      // console.log(!isAllSubTasksCheckedBeforeRef.current, isAllSubTasksChecked)
      changeOpen(false);
    }
    isAllSubTasksCheckedBeforeRef.current = isAllSubTasksChecked;
  }, [changeOpen, isAllSubTasksChecked])


  const onElDrop = useCallback((newNote: RoutineNote, dropped: TaskGroup) => {
    onGroupReorder?.(newNote, dropped);
  }, [onGroupReorder])

  const dragEndCallbacksRef = useRef<(() => void)[]>([]);
  const onElDragEnd = useCallback(() => {
    dragEndCallbacksRef.current.forEach(cb => cb());
    dragEndCallbacksRef.current = [];
    setGroupMode("idle");
  }, [])

  const { isDragging: _isDragging, indicator } = useGroupDnd({
    group,
    groupRef,
    isGroupOpen: open,
    canDrag: isMobile() ? groupMode === "drag-ready" : true,
    onElDrop,
    onElDragEnd,
  });

  // isDragging sync
  useEffect(() => {
    if (_isDragging) {
      setGroupMode("dragging");
    } else {
      setGroupMode("idle");
    }
  }, [_isDragging])

  useEffect(() => {
    switch (groupMode) {
      case "drag-ready":
      case "dragging": {
        if (open) {
          _setOpen(false);
          dragEndCallbacksRef.current.push(() => _setOpen(true));
        }
      }
    }
  }, [groupMode, open])

  const onPressChange = useCallback((isPressed: boolean) => {
    if (isPressed && groupMode !== "pressed") {
      setGroupMode("pressed");
    } else if (!isPressed && groupMode !== "dragging") {
      setGroupMode("idle");
    }
  }, [groupMode])

  // 지정시간동안 press 하고나서
  const onAfterLongPressDelay = useCallback(() => {
    setGroupMode("drag-ready");
  }, [])


  const onClick = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    onGroupClick?.(group);
  }, [group, onGroupClick])


  return (
    <div className={bem()}>
      <Accordion
        disableGutters
        elevation={0}
        expanded={open}
        onChange={() => changeOpen(!open)}
        css={{
          backgroundColor: bgColor,
          "&::before": {
            display: "none",
          }
        }}
      >
        <header
          ref={groupRef}
          className={bem('header', '', className)}
          css={[
            baseHeaderStyle,
            groupMode === "pressed" && pressedStyle,
            groupMode === "drag-ready" && dragReadyStyle,
            groupMode === "dragging" && draggingStyle,
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
              padding: "0 0 0 0.3em",
              margin: "0 0",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            <AccordionSummary
              component={'div'}
              expandIcon={<Icon icon='chevron-right' />}
              css={{
                padding: "0",
                width: "100%",
                flexDirection: "row-reverse",
                gap: "0.5em",
                fontWeight: "500",

                // 열림상태
                [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <CancelLineName
                name={group.name}
                cancel={isAllSubTasksChecked}
              />
            </AccordionSummary>
          </Touchable>
          <OptionIcon onOptionMenu={(m) => onOptionMenu?.(m, group)} />
          {indicator}
        </header>
        <AccordionDetails css={{ padding: "0" }}>
          {group.children.map(task => renderTask(task, group))}
        </AccordionDetails>
      </Accordion>
    </div>
  )
})