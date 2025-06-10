/** @jsxImportSource @emotion/react */
import { NoteRoutineGroup, useNoteDayStore } from "@/entities/note";
import { routineGroupRepository } from "@/entities/routine-group";
import { CancelLineName, CheckableFlexContainer, checkableStyle, DragHandleMenu } from "@/features/checkable";
import { STYLES } from "@/shared/colors/styles";
import { Icon } from "@/shared/components/Icon";
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
  const [dragState, setDragState] = useState<DragState>("idle");
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
      canDrag: Platform.isMobile ? dragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: ["ROUTINE", "GROUP"],
      ref: droppableRef,
      rectSplitCount: group.isOpen ? "two" : "three",
    }
  });

  const handleOpen = useCallback(() => {
    handleRoutineGroupOpen();
  }, [handleRoutineGroupOpen]);

  const isAllSubTasksChecked = group.routines.every(r => r.state === 'accomplished');

  // dragging 상태에 따라 isOpen 상태를 조정
  useEffect(() => {
    // handleOpen(!isDragging);
  }, [handleOpen, group.routines, isDragging]);

  /**
   * Context Menu를 열면 routine control을 연다
   */
  const handleContext = useCallback(async () => {
    // 과거의 RoutineGroup은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine group control cannot be opened for past routines.");
      return;
    }
    const sourceRoutineGroup = await routineGroupRepository.load(group.name);
    openRoutineGroupControls(sourceRoutineGroup);
  }, [day, group.name, openRoutineGroupControls]);

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={group.isOpen}
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
          touchAction: "none",
          backgroundColor: isDragging || dragState === "ready" ? STYLES.palette.accent : undefined,
        }}
      >
        <AccordionSummary
          component={'div'}
          expandIcon={<Icon icon='chevron-right' />}
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
              cancel={isAllSubTasksChecked}
            />
            <DragHandleMenu
              ref={draggableRef}
              dragState={dragState}
              setDragState={setDragState}
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