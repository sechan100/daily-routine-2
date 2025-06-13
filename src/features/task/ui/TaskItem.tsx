/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { STYLES } from "@/shared/colors/styles";
import { Touchable } from "@/shared/components/Touchable";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu } from "@/shared/dnd/dnd-item-ui";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { Platform } from "obsidian";
import { useCallback, useRef, useState } from "react";


type Props = {
  task: Task;
  onClick?: (task: Task) => void;
  onContextMenu?: (task: Task) => void;

  /**
   * draggingHandle 앞에 추가될 icon option 컴포넌트들을 정의한다.
   */
  optionIcons?: React.ReactNode[];
}
export const TaskItem = ({
  task,
  onClick,
  onContextMenu,
  optionIcons = [],
}: Props) => {
  const [dragState, setDragState] = useState<DragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    dndCase
  } = useDnd({
    dndItem: {
      id: task.name,
    },
    draggable: {
      type: "TASK",
      canDrag: Platform.isMobile ? dragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: ["TASK"],
      ref: droppableRef,
      rectSplitCount: "two"
    }
  });

  const handleClick = useCallback(async () => {
    onClick?.(task);
  }, [onClick, task]);

  const handleContextMenu = useCallback(async () => {
    onContextMenu?.(task);
  }, [onContextMenu, task]);

  return (
    <div
      ref={droppableRef}
      css={{
        position: "relative",
        backgroundColor: isDragging || dragState === "ready" ? STYLES.palette.accent : undefined,
      }}
    >
      <CheckableRippleBase>
        <CheckableFlexContainer>
          <Touchable
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckableArea checkable={task} />
          </Touchable>
          <div css={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "100%",
            cursor: "pointer",
          }}>
            {optionIcons.map((option, index) => (
              <div key={index}>{option}</div>
            ))}
            <DragHandleMenu
              ref={draggableRef}
              dragState={dragState}
              setDragState={setDragState}
            />
          </div>
        </CheckableFlexContainer>
      </CheckableRippleBase>
      <Indicator dndCase={dndCase} depth={0} />
    </div>
  )
}