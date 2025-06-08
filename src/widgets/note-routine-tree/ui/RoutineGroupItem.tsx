/** @jsxImportSource @emotion/react */
import { NoteRoutineGroup } from "@/entities/note";
import { CancelLineName, CheckableFlexContainer, checkableStyle, DragHandleMenu } from "@/features/checkable";
import { STYLES } from "@/shared/colors/styles";
import { Icon } from "@/shared/components/Icon";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { useLeaf } from "@/shared/view/use-leaf";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from "@mui/material";
import { Platform } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoutineDndItem } from "../model/dnd-item";
import { useRoutineTreeController } from "../stores/use-routine-tree-controller";
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
  const { openGroup } = useRoutineTreeController();
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

  const changeOpen = useCallback((isOpen: boolean) => {
    openGroup(group.name, isOpen);
  }, [openGroup, group.name]);

  const isAllSubTasksChecked = group.routines.every(r => r.state === 'accomplished');

  // dragging 상태에 따라 isOpen 상태를 조정
  useEffect(() => {
    changeOpen(!isDragging);
  }, [changeOpen, group.routines, isDragging]);

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={group.isOpen}
      onChange={() => changeOpen(!group.isOpen)}
      css={{
        backgroundColor: bgColor,
        "&::before": {
          display: "none",
        },
      }}
    >
      <div
        ref={droppableRef}
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