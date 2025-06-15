/** @jsxImportSource @emotion/react */
import { CancelLineName } from "@/components/checkable/CancelLineName";
import { checkableStyle } from "@/components/checkable/checkable-style";
import { CheckableFlexContainer } from "@/components/checkable/CheckableFlexContainer";
import { DragHandleMenu } from "@/components/checkable/DragHandleMenu";
import { NOTE_EL_CLICK_DEBOUNCE_WAIT } from "@/components/config/click-debounce-wait";
import { routineGroupRepository } from "@/entities/repository/group-repository";
import { NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { Touchable } from "@/shared/components/Touchable";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { STYLES } from "@/shared/styles/styles";
import { useLeaf } from "@/shared/view/use-leaf";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from "@mui/material";
import { Notice, Platform } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useRoutineTreeContext } from "./context";
import { RoutineDndItem } from "./dnd-item";
import { renderRoutineTree } from "./render-routine-tree";
import { useOpenRoutineGroup } from "./use-open-routine-group";



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
  /**
   * 모바일에서 touch할 때, 엘리먼트들의 height가 너무 작아서 위아래 다른 엘리먼트가 같이 눌리는 일이 빈번함.
   * 하지만 크기를 더 키우면 못생겨져서 debounce로 해결
   */
  const debouncedhandleOpen = useDebouncedCallback(handleOpen, NOTE_EL_CLICK_DEBOUNCE_WAIT, {
    leading: true,
    trailing: false,
  });


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
  const handleContextMenu = useCallback(async () => {
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
      onChange={debouncedhandleOpen}
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
          backgroundColor: isDragging || mobileDragState === "ready" ? STYLES.palette.accent : undefined,
        }}
      >
        <AccordionSummary
          component={'div'}
          expandIcon={<ObsidianIcon icon='chevron-right' />}
          css={{
            paddingRight: 0,
            paddingLeft: checkableStyle.paddingLeft,
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
            <Touchable
              onContextMenu={handleContextMenu}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CancelLineName
                name={group.name}
                cancel={isAllSubRoutineChecked}
              />
            </Touchable>
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