/** @jsxImportSource @emotion/react */
import { RoutineNote, TaskEntity, TaskGroup } from '@entities/note';
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from '@mui/material';
import { Icon } from '@shared/components/Icon';
import { Touchable } from '@shared/components/Touchable';
import { dr } from '@shared/utils/daily-routine-bem';
import { useLeaf } from '@shared/view/use-leaf';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGroupDnd } from '../dnd/use-group-dnd';
import { baseHeaderStyle, draggingStyle, dragReadyStyle, elementHeight, pressedStyle } from './base-element-style';
import { DELAY_TOUCH_START } from '../dnd/dnd-context';
import { OptionIcon } from './OptionIcon';
import { CancelLineName } from './CancelLineName';
import { renderTask } from './render-task-widget';
import { Menu } from 'obsidian';
import { isMobile } from '@shared/utils/plugin-service-locator';



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
  const bgColor = useLeaf(s=>s.leafBgColor);
  const isAllSubTasksChecked = group.children.every(t => t.state !== "un-checked")
  const [open, setOpen] = useState(isAllSubTasksChecked ? false : true);
  
  useEffect(() => {
    if(isAllSubTasksChecked){
      setOpen(false);
    }
  }, [isAllSubTasksChecked])

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
    if(_isDragging){
      setGroupMode("dragging");
    } else {
      setGroupMode("idle");
    }
  }, [_isDragging])

  useEffect(() => {
    switch(groupMode){
      case "drag-ready": 
      case "dragging": {
        if(open){
          setOpen(false);
          dragEndCallbacksRef.current.push(() => setOpen(true));
        }
      }
    }
  }, [groupMode, open])

  const onPressChange = useCallback((isPressed: boolean) => {
    if(isPressed && groupMode !== "pressed"){
      setGroupMode("pressed");
    } else if(!isPressed && groupMode !== "dragging"){
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
        onChange={() => setOpen(!open)}
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
        <AccordionDetails css={{padding: "0"}}>
          {group.children.map(task => renderTask(task, group))}
        </AccordionDetails>
      </Accordion>
    </div>
  )
})