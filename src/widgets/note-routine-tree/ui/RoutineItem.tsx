/** @jsxImportSource @emotion/react */
import { NoteRoutine, NoteRoutineGroup } from "@/entities/note";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu } from "@/features/checkable";
import { STYLES } from "@/shared/colors/palette";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { css } from "@emotion/react";
import { Platform } from "obsidian";
import { useMemo, useRef, useState } from "react";
import { RoutineDndItem } from "../model/dnd-item";


const indentStyle = css({
  borderLeft: "1px solid var(--color-base-30)",
  margin: "0 0 0 20px",
})

type Props = {
  routine: NoteRoutine;
  parent: NoteRoutineGroup | null;
  depth: number;
}
export const RoutineItem = ({
  routine,
  parent,
  depth,
}: Props) => {
  const [dragState, setDragState] = useState<DragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const dndItem = useMemo<RoutineDndItem>(() => ({
    id: routine.name,
    nrlType: "routine",
    routine,
  }), [routine]);

  const {
    isDragging,
    isOver,
    dndCase
  } = useDnd({
    dndItem,
    draggable: {
      type: "ROUTINE",
      canDrag: Platform.isMobile ? dragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: depth === 0 ? ["ROUTINE", "GROUP"] : ["ROUTINE"],
      ref: droppableRef,
      rectSplitCount: "two"
    }
  });

  return (
    <div css={depth !== 0 && indentStyle}>
      <div
        ref={droppableRef}
        css={{
          position: "relative",
          touchAction: "none",
          backgroundColor: isDragging || dragState === "ready" ? STYLES.palette.accent : undefined,
        }}
      >
        <CheckableRippleBase>
          <CheckableFlexContainer>
            <CheckableArea checkable={routine} />
            <DragHandleMenu
              ref={draggableRef}
              dragState={dragState}
              setDragState={setDragState}
            />
          </CheckableFlexContainer>
        </CheckableRippleBase>
        <Indicator dndCase={dndCase} depth={0} />
      </div>
    </div>
  )
}