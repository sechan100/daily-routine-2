/** @jsxImportSource @emotion/react */
import { NoteRoutineGroup, useNoteDayStore } from "@/entities/note";
import { routineGroupRepository } from "@/entities/routine-group";
import { STYLES } from "@/shared/colors/styles";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { CancelLineName, CheckableFlexContainer, checkableStyle, DragHandleMenu } from "@/shared/dnd/dnd-item-ui";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { useLeaf } from "@/shared/view/use-leaf";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from "@mui/material";
import { Notice, Platform } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoutineTreeContext } from "../model/context";
import { RoutineDndItem } from "../model/dnd-item";
import { useOpenRoutineGroup } from "../model/use-open-routine-group";
import { renderRoutineTree } from "./render-routine-tree";



type Props = {
  group: NoteRoutineGroup;
  depth: number;
}
export const RoutineGroupItem = ({
  group,
  depth,
}: Props) => {
  const bgColor = useLeaf(s => s.leafBgColor);
  const day = useNoteDayStore(s => s.day);
  const { openRoutineGroupControls } = useRoutineTreeContext();
  const { handleRoutineGroupOpen } = useOpenRoutineGroup(group);

  /**
   * open/close 상태를 관리하기 위한 상태.
   * drag 할 때, 일시적으로 close하는 등의 관리를 위해서 따로 상태로 선언한다.
   */
  const [open, setOpen] = useState(group.isOpen);
  const [isAllSubRoutineChecked, setIsAllSubRoutineChecked] = useState(group.routines.every(r => r.state === "accomplished"));
  const [mobileDragState, setMobileDragState] = useState<DragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const dndItem = useMemo<RoutineDndItem>(() => ({
    id: group.name,
    nrlType: "routine-group",
    routineGroup: group,
  }), [group]);

  const {
    isDragging,
    isOver,
    dndCase
  } = useDnd({
    dndItem,
    draggable: {
      type: "GROUP",
      canDrag: Platform.isMobile ? mobileDragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: ["ROUTINE", "GROUP"],
      ref: droppableRef,
      rectSplitCount: group.isOpen ? "two" : "three",
    }
  });

  const handleOpen = useCallback(() => {
    handleRoutineGroupOpen(!group.isOpen);
  }, [group.isOpen, handleRoutineGroupOpen]);

  // dragging 상태에 따라 open 상태를 일시적으로 조정
  useEffect(() => {
    if (isDragging) {
      setOpen(false);
    } else {
      setOpen(group.isOpen);
    }
  }, [handleOpen, group.routines, isDragging, group.isOpen]);

  /**
   * Context Menu를 열면 routine control을 연다
   */
  const handleContext = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    // 이렇게 2개를 다 해줘야 mobile에서 contextMenu가 2번 호출되는 문제를 방지할 수 있다.
    e.preventDefault();
    e.stopPropagation();
    // 과거의 RoutineGroup은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine group control cannot be opened for past routines.");
      return;
    }
    const sourceRoutineGroup = await routineGroupRepository.load(group.name);
    openRoutineGroupControls(sourceRoutineGroup);
  }, [day, group.name, openRoutineGroupControls]);

  // group이 변경되면 isAllSubRoutineChecked와 open/close 상태를 업데이트
  useEffect(() => {
    const newIsAllSubRoutineChecked = group.routines.every(r => r.state === "accomplished");
    if (!isAllSubRoutineChecked && newIsAllSubRoutineChecked) {
      setIsAllSubRoutineChecked(true);
      handleRoutineGroupOpen(false);
    }
    else if (!newIsAllSubRoutineChecked) {
      setIsAllSubRoutineChecked(false);
    }
  }, [group.name, group.isOpen, handleRoutineGroupOpen, group.routines, isAllSubRoutineChecked]);

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={open}
      onChange={handleOpen}
      css={{
        backgroundColor: bgColor,
        "&::before": {
          display: "none",
        },
      }}
    >
      <div
        ref={droppableRef}
        onContextMenu={handleContext}
        css={{
          position: "relative",
          backgroundColor: isDragging || mobileDragState === "ready" ? STYLES.palette.accent : undefined,
        }}
      >
        <AccordionSummary
          component={'div'}
          expandIcon={<ObsidianIcon icon='chevron-right' />}
          css={{
            padding: checkableStyle.padding,
            minHeight: "0 !important",
            [`& .${accordionSummaryClasses.content}`]: {
              margin: "0",
            },
            width: "100%",
            gap: "0.5em",
            flexDirection: "row-reverse",
            fontWeight: "500",
            // 열림상태
            [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
              transform: 'rotate(90deg)',
            },
            // ripple 남아있는 버그 해결
            [`&.Mui-focusVisible`]: {
              background: "unset !important",
            }
          }}
        >
          <CheckableFlexContainer excludePadding>
            <CancelLineName
              name={group.name}
              cancel={isAllSubRoutineChecked}
            />
            <DragHandleMenu
              ref={draggableRef}
              dragState={mobileDragState}
              setDragState={setMobileDragState}
            />
          </CheckableFlexContainer>
        </AccordionSummary>
        <Indicator dndCase={dndCase} depth={0} />
      </div>
      <AccordionDetails css={{ padding: "0" }}>
        {group.routines.map(r => renderRoutineTree(r, group, depth + 1))}
      </AccordionDetails>
    </Accordion>
  )
}