/** @jsxImportSource @emotion/react */
import { NoteRoutine, NoteRoutineGroup, useNoteDayStore } from "@/entities/note";
import { routineRepository } from "@/entities/routine";
import { STYLES } from "@/shared/colors/styles";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu } from "@/shared/dnd/dnd-item-ui";
import { DragState } from "@/shared/dnd/drag-state";
import { DRAG_ITEM_INDENT, Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { css } from "@emotion/react";
import { Notice, Platform } from "obsidian";
import { useCallback, useMemo, useRef, useState } from "react";
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
}
export const RoutineItem = ({
  routine,
  // parent,
  depth,
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
  const handleContext = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // 과거의 루틴은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine control cannot be opened for past routines.");
      return;
    }
    const sourceRoutine = await routineRepository.load(routine.name);
    openRoutineControls(sourceRoutine);
  }, [day, openRoutineControls, routine.name]);


  /**
   * routine을 클릭하면 check하거나 uncheck하는 등의 동작을 수행한다.
   */
  const handleClick = useCallback(() => {
    handleRoutineCheck();
  }, [handleRoutineCheck]);



  return (
    <div css={depth !== 0 && indentStyle}>
      <div
        ref={droppableRef}
        onClick={handleClick}
        onContextMenu={handleContext}
        css={{
          position: "relative",
          touchAction: "none",
          backgroundColor: isDragging || mobileDragState === "ready" ? STYLES.palette.accent : undefined,
        }}
      >
        <CheckableRippleBase>
          <CheckableFlexContainer>
            <CheckableArea checkable={routine} />
            <DragHandleMenu
              ref={draggableRef}
              dragState={mobileDragState}
              setDragState={setMobileDragState}
            />
          </CheckableFlexContainer>
        </CheckableRippleBase>
        <Indicator dndCase={dndCase} depth={0} />
      </div>
    </div>
  )
}