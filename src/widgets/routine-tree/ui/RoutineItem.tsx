/** @jsxImportSource @emotion/react */
import { NoteRoutine, NoteRoutineGroup, useNoteDayStore } from "@/entities/note";
import { routineRepository } from "@/entities/routine";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu, NOTE_EL_CLICK_DEBOUNCE_WAIT } from "@/features/note-component";
import { STYLES } from "@/shared/colors/styles";
import { Touchable } from "@/shared/components/Touchable";
import { DragState } from "@/shared/dnd/drag-state";
import { DRAG_ITEM_INDENT, Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { css } from "@emotion/react";
import { Notice, Platform } from "obsidian";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useRoutineTreeContext } from "../model/context";
import { RoutineDndItem } from "../model/dnd-item";
import { useCheckRoutine } from "../model/use-check-routine";


const indentStyle = css({
  borderLeft: "1px solid var(--color-base-30)",
  margin: `0 0 0 ${DRAG_ITEM_INDENT}px`,
})

type Props = {
  routine: NoteRoutine;
  parent: NoteRoutineGroup | null;
  depth: number;
  optionIcons?: React.ReactNode[];
}
export const RoutineItem = ({
  routine,
  // parent,
  depth,
  optionIcons = [],
}: Props) => {
  const day = useNoteDayStore(s => s.day);
  const { handleRoutineCheck } = useCheckRoutine(routine);
  const { openRoutineControls } = useRoutineTreeContext();

  const [mobileDragState, setMobileDragState] = useState<DragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const dndItem = useMemo<RoutineDndItem>(() => ({
    id: routine.name,
    nrlType: "routine",
    routine,
  }), [routine]);

  const {
    isDragging,
    dndCase
  } = useDnd({
    dndItem,
    draggable: {
      type: "ROUTINE",
      canDrag: Platform.isMobile ? mobileDragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: depth === 0 ? ["ROUTINE", "GROUP"] : ["ROUTINE"],
      ref: droppableRef,
      rectSplitCount: "two"
    }
  });

  /**
   * Context Menu를 열면 routine control을 연다
   */
  const handleContextMenu = useCallback(async () => {
    // 과거의 루틴은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine control cannot be opened for past routines.");
      return;
    }
    const sourceRoutine = await routineRepository.load(routine.name);
    openRoutineControls(sourceRoutine);
  }, [day, openRoutineControls, routine.name]);

  /**
   * 모바일에서 touch할 때, 엘리먼트들의 height가 너무 작아서 위아래 다른 엘리먼트가 같이 눌리는 일이 빈번함.
   * 하지만 크기를 더 키우면 못생겨져서 debounce로 해결
   */
  const debouncedHandleRoutineCheck = useDebouncedCallback(handleRoutineCheck, NOTE_EL_CLICK_DEBOUNCE_WAIT, {
    leading: true,
    trailing: false,
  });
  const handleClick = useCallback(() => {
    debouncedHandleRoutineCheck();
  }, [debouncedHandleRoutineCheck]);

  return (
    <div
      ref={droppableRef}
      css={[
        {
          position: "relative",
          backgroundColor: isDragging || mobileDragState === "ready" ? STYLES.palette.accent : undefined,
        },
        depth !== 0 && indentStyle
      ]}
    >
      <CheckableRippleBase>
        <CheckableFlexContainer>
          <Touchable
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckableArea checkable={routine} />
          </Touchable>
          <div css={{
            display: "flex",
            alignItems: "stretch",
            gap: "8px",
            cursor: "pointer",
          }}>
            {optionIcons.map((option, index) => (
              <div key={index}>{option}</div>
            ))}
            <DragHandleMenu
              ref={draggableRef}
              dragState={mobileDragState}
              setDragState={setMobileDragState}
            />
          </div>
        </CheckableFlexContainer>
      </CheckableRippleBase>
      <Indicator dndCase={dndCase} depth={0} />
    </div >
  )
}