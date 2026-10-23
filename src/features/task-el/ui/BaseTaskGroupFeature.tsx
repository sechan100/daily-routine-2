/** @jsxImportSource @emotion/react */
import { RoutineNote, TaskGroup, TaskGroupEntity } from '@entities/note';
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from '@mui/material';
import { Icon } from '@shared/components/Icon';
import { Touchable } from '@shared/components/Touchable';
import { dr } from '@shared/utils/daily-routine-bem';
import { useLeaf } from '@shared/view/use-leaf';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGroupDnd } from '../dnd/use-group-dnd';
import { baseHeaderStyle, draggingStyle, dragReadyStyle, elementHeight, focusRingStyle, pressedStyle, rowRadius } from './base-element-style';
import { DELAY_TOUCH_START } from '../dnd/dnd-context';
import { OptionIcon } from './OptionIcon';
import { CancelLineName } from './CancelLineName';
import { renderTask } from './render-task-widget';
import { Menu, Notice } from 'obsidian';
import { showMenu } from '@shared/components/Menu';
import { isMobile } from '@shared/utils/plugin-service-locator';
import { useRoutineNote } from '@features/note';
import { updateNote } from '../model/update-note';
import { t, formatNumber } from '@shared/i18n';



const bem = dr("group");

// 마지막 체크가 애니메이션으로 보인 뒤에 그룹을 접기 위한 지연
const AUTO_COLLAPSE_DELAY = 600;

type GroupMode = "idle" | "pressed" | "drag-ready" | "dragging";

interface Props {
  group: TaskGroup;
  onOptionMenu?: (m: Menu, group: TaskGroup) => void | Promise<void>;
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
  const routineNote = useRoutineNote();
  const { note } = routineNote;


  // dnd 시에 발생하는 일시적인 open/close를 위해서 따로 상태로 저장
  const [open, _setOpen] = useState(group.isOpen);

  useEffect(() => {
    _setOpen(group.isOpen);
  }, [group])
  
  // open 상태를 변경하는 함수. _setOpen은 일시적 상태변경이므로, 데이터 일관성을 위해서는 아래 함수를 사용할 것.
  const changeOpen = useCallback(async (isOpen: boolean) => {
    _setOpen(isOpen);
    try {
      // 자동으로 접는 타이머처럼 오래전에 본 note를 기준으로 호출될 수 있으므로, 파일의 최신 내용에서 이 그룹의 상태만 바꾼다.
      const newNote = await updateNote(note, current => TaskGroupEntity.openGroup(current, group.name, isOpen));
      routineNote.setNote(newNote);
    } catch(e) {
      console.error("Failed to save the open state of the group.", e);
      new Notice(t("tasks.group.saveFailed", { name: group.name }));
    }
  }, [group.name, note, routineNote])


  /**
   * 모든 서브태스크가 체크되었을 때 그룹을 자동으로 닫아주는 기능을 구현
   * 마지막 체크 애니메이션이 보이도록 지연시키고, 그 사이 체크가 해제되거나 unmount되면 취소한다.
   */
  const total = group.children.length;
  const doneCount = group.children.filter(t => t.state !== "un-checked").length;
  const isAllSubTasksChecked = total !== 0 && doneCount === total;
  const isAllSubTasksCheckedBeforeRef = useRef(isAllSubTasksChecked);
  // 타이머가 돌고 있는 동안 note가 바뀌어도 최신 changeOpen을 부르기 위해 ref로 들고 있는다.
  const changeOpenRef = useRef(changeOpen);
  useEffect(() => {
    changeOpenRef.current = changeOpen;
  }, [changeOpen])

  useEffect(() => {
    const wasAllChecked = isAllSubTasksCheckedBeforeRef.current;
    isAllSubTasksCheckedBeforeRef.current = isAllSubTasksChecked;
    if(wasAllChecked || !isAllSubTasksChecked) return;

    const timer = window.setTimeout(() => {
      void changeOpenRef.current(false);
    }, AUTO_COLLAPSE_DELAY);
    return () => window.clearTimeout(timer);
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
          _setOpen(false);
          dragEndCallbacksRef.current.push(() => _setOpen(true));
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
  

  const onClick = useCallback(() => {
    onGroupClick?.(group);
  }, [group, onGroupClick])

  // 데스크톱 우클릭: "…" 아이콘과 같은 옵션 메뉴를 마우스 위치에 연다. (터치 long press는 drag-ready)
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if(!onOptionMenu) return;
    void showMenu((m) => onOptionMenu(m, group), { mouseEvent: e.nativeEvent });
  }, [group, onOptionMenu])

  const isEmpty = total === 0;


  return (
    <div className={bem()}>
      <Accordion 
        disableGutters
        elevation={0}
        expanded={open}
        onChange={() => { void changeOpen(!open); }}
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
            // 비어 있는 그룹은 흐리게
            isEmpty && { opacity: 0.55 },
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
              paddingInlineStart: "0.3em",
              margin: "0 0",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            <AccordionSummary
              component={'div'}
              expandIcon={<Icon icon='chevron-right' />}
              css={[
                {
                  padding: "0",
                  width: "100%",
                  minWidth: 0,
                  flexDirection: "row-reverse",
                  gap: "0.5em",
                  fontWeight: "500",
                  borderRadius: rowRadius,

                  // 긴 그룹 이름이 줄어들며 ellipsis 되도록
                  [`& .${accordionSummaryClasses.content}`]: {
                    minWidth: 0,
                    alignItems: "center",
                    columnGap: "0.5em",
                  },

                  // 열림상태
                  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
                    transform: 'rotate(90deg)',
                  },
                  // 오른쪽→왼쪽 언어에서는 Obsidian이 화살표 아이콘을 좌우로 뒤집어 왼쪽을 가리키므로, 펼칠 때 반대로 돌려야 아래를 가리킨다.
                  [`.mod-rtl & .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
                    transform: 'rotate(-90deg)',
                  },
                },
                focusRingStyle,
              ]}
            >
              <CancelLineName
                name={group.name}
                cancel={isAllSubTasksChecked}
              />
              {!isEmpty && (
                <span
                  className={bem("progress")}
                  css={{
                    flexShrink: 0,
                    fontSize: "var(--font-ui-smaller)",
                    fontWeight: "normal",
                    color: "var(--text-muted)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatNumber(doneCount)}/{formatNumber(total)}
                </span>
              )}
            </AccordionSummary>
          </Touchable>
          <OptionIcon label={t("tasks.group.options")} onOptionMenu={(m) => onOptionMenu?.(m, group)} />
          {indicator}
        </header>
        {!isEmpty && (
          <AccordionDetails css={{padding: "0"}}>
            {group.children.map(task => renderTask(task, group))}
          </AccordionDetails>
        )}
      </Accordion>
    </div>
  )
})