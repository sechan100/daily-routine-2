/* eslint-disable @typescript-eslint/no-explicit-any */
/** @jsxImportSource @emotion/react */
import { Checkable, CheckableState } from "@/entities/note";
import { STYLES } from "@/shared/colors/styles";
import { Touchable } from "@/shared/components/Touchable";
import { DragState } from "@/shared/dnd/drag-state";
import { DRAG_ITEM_INDENT, Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { useSettingsStores } from "@/shared/settings";
import { css } from "@emotion/react";
import { Platform } from "obsidian";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { NOTE_EL_CLICK_DEBOUNCE_WAIT } from "../config/click-debounce-wait";
import { getNextCheckableState } from "../model/dispatch-checkable-state";
import { CheckableArea } from "./CheckableArea";
import { CheckableFlexContainer } from "./CheckableFlexContainer";
import { CheckableRippleBase } from "./CheckableRippleBase";
import { DragHandleMenu } from "./DragHandleMenu";


const hideCompletedMs = 500;

const indentStyle = css({
  borderLeft: "1px solid var(--color-base-30)",
  margin: `0 0 0 ${DRAG_ITEM_INDENT}px`,
})

type Props = {
  checkable: Checkable;
  depth: number;
  draggableType: string;
  droppableAccept: string[];
  dndItem: any;

  onStateChange?: (state: CheckableState) => void;
  onContextMenu?: () => void;
  optionIcons?: React.ReactNode[];
}
export const CheckableItem = ({
  checkable,
  depth,
  draggableType,
  droppableAccept,
  dndItem,

  onStateChange,
  onContextMenu,
  optionIcons = [],
}: Props) => {
  const [mobileDragState, setMobileDragState] = useState<DragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    dndCase
  } = useDnd({
    dndItem,
    draggable: {
      type: draggableType,
      canDrag: Platform.isMobile ? mobileDragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: droppableAccept,
      ref: droppableRef,
      rectSplitCount: "two"
    }
  });

  const handleContextMenu = useCallback(() => {
    if (onContextMenu) {
      onContextMenu();
    }
  }, [onContextMenu]);

  /**
   * hideCompletedRoutines/Tasks 옵션을 사용할 경우, 클릭하자마자 routine 또는 task가 뿅 사라져버린다.
   * 원하는 상황은 체크박스와 취소선 애니메이션이 끝난 후에 사라지는 것인데,
   * 이를 위해, 실제 상태 업데이트는 일정시간 뒤에 처리하고, 대신 가짜 checkable 상태를 만들어서 애니메이션을 진행하는 식으로 구현한다.
   */
  const [localCheckable, setLocalCheckable] = useState<Checkable>(checkable);
  useEffect(() => {
    setLocalCheckable(checkable);
  }, [checkable]);
  const [isPending, setIsPending] = useState(false);
  const handleClick = useCallback(() => {
    const newState = getNextCheckableState(checkable.state);
    setIsPending(true);
    setLocalCheckable({
      ...checkable,
      state: newState,
    });
    setTimeout(() => {
      onStateChange?.(newState);
      setLocalCheckable(checkable);
      setIsPending(false);
    }, useSettingsStores.getState().hideCompletedTasksAndRoutines ? hideCompletedMs : 0);
  }, [checkable, onStateChange]);
  /**
 * 모바일에서 touch할 때, 엘리먼트들의 height가 너무 작아서 위아래 다른 엘리먼트가 같이 눌리는 일이 빈번함.
 * 하지만 크기를 더 키우면 못생겨져서 debounce로 해결
 */
  const debouncedHandleClick = useDebouncedCallback(handleClick, NOTE_EL_CLICK_DEBOUNCE_WAIT, {
    leading: true,
    trailing: false,
  });

  return (
    <div
      ref={droppableRef}
      css={[
        {
          position: "relative",
          backgroundColor: isDragging || mobileDragState === "ready" ? STYLES.palette.accent : undefined,
          opacity: isPending ? 0 : 1,
          transition: `opacity ${hideCompletedMs * 2}ms ease-in-out`, // 2배 시간을 줘야 좀 더 부드럽게 사라짐
        },
        depth !== 0 && indentStyle
      ]}
    >
      <CheckableRippleBase>
        <CheckableFlexContainer>
          <Touchable
            onClick={debouncedHandleClick}
            onContextMenu={handleContextMenu}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckableArea checkable={localCheckable} />
          </Touchable>
          <div css={{
            display: "flex",
            alignItems: "stretch",
            gap: "8px",
            cursor: "pointer",
          }}>
            {optionIcons.map((option, index) => (
              <div
                css={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                key={index}
              >
                {option}
              </div>
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