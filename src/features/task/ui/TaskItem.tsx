/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
// eslint-disable-next-line fsd-import/layer-imports
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu, NOTE_EL_CLICK_DEBOUNCE_WAIT } from "@/features/note-component";
import { STYLES } from "@/shared/colors/styles";
import { Touchable } from "@/shared/components/Touchable";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { Platform } from "obsidian";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";


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
  /**
   * 모바일에서 touch할 때, 엘리먼트들의 height가 너무 작아서 위아래 다른 엘리먼트가 같이 눌리는 일이 빈번함.
   * 하지만 크기를 더 키우면 못생겨져서 debounce로 해결
   */
  const debouncedhandleClick = useDebouncedCallback(handleClick, NOTE_EL_CLICK_DEBOUNCE_WAIT, {
    leading: true,
    trailing: false,
  });

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
            onClick={debouncedhandleClick}
            onContextMenu={handleContextMenu}
            sx={{
              width: "100%",
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