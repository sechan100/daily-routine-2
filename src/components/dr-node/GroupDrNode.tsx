/** @jsxImportSource @emotion/react */
import { Indicator } from "@/components/dnd/Indicator";
import { CancelLineName } from "@/components/dr-node/CancelLineName";
import { DR_NODE_CLICK_DEBOUNCE_WAIT } from "@/components/dr-node/click-debounce-wait";
import { drNodeStyle } from "@/components/dr-node/dr-node-tyle";
import { DrNodeFlexContainer } from "@/components/dr-node/DrNodeFlexContainer";
import { Checkable, Group } from "@/entities/types/dr-nodes";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { Touchable } from "@/shared/components/Touchable";
import { STYLES } from "@/shared/styles/styles";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from "@mui/material";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { DndCase } from "../dnd/dnd-case";
import { PreDragState } from "../dnd/pre-drag-state";
import { OptionIconsContainer } from "./OptionIconsContainer";


export type GroupDrNodeDndModule = {
  isDragging: boolean;
  isOver: boolean;
  droppable: RefObject<HTMLDivElement>;
  preDragState: PreDragState;
  dndCase: DndCase | null;
}

type Props<C extends Checkable> = {
  group: Group<C>;
  depth: number;
  children: (group: Group<C>, depth: number) => React.ReactNode;
  optionIcons?: React.ReactNode[];
  onOpenChange?: (isOpen: boolean) => void;
  onContextMenu?: () => void;
  dndModule?: GroupDrNodeDndModule;
  useCancelLine?: boolean;
}
export const GroupDrNode = <C extends Checkable>({
  group,
  depth,
  children,
  optionIcons,
  onOpenChange,
  onContextMenu,
  dndModule,
  useCancelLine = true,
}: Props<C>) => {
  const [isAllChildChecked, setIsAllChildChecked] = useState(group.children.every(r => r.state === "accomplished"));

  const changeOpen = useCallback((isOpen: boolean) => {
    if (group.isOpen === isOpen) return;
    onOpenChange?.(isOpen);
  }, [group.isOpen, onOpenChange]);

  const handleExpandChange = useCallback(() => {
    if (group.children.length === 0) return; // 자식이 없으면 열지 않음
    changeOpen(!group.isOpen);
  }, [changeOpen, group.children.length, group.isOpen]);

  /**
   * 모바일에서 touch할 때, 엘리먼트들의 height가 너무 작아서 위아래 다른 엘리먼트가 같이 눌리는 일이 빈번함.
   * 하지만 크기를 더 키우면 못생겨져서 debounce로 해결
   */
  const debouncedHandleExpandChange = useDebouncedCallback(handleExpandChange, DR_NODE_CLICK_DEBOUNCE_WAIT, {
    leading: true,
    trailing: false,
  });

  // dragging 상태에 따라 open 상태를 일시적으로 조정
  const shouldOpenGroup = useRef<boolean>(false);
  useEffect(() => {
    if (!dndModule) return;
    if (dndModule.isDragging) {
      if (group.isOpen) {
        shouldOpenGroup.current = true;
        changeOpen(false);
      }
    } else {
      if (!shouldOpenGroup.current) return;
      changeOpen(true);
      shouldOpenGroup.current = false;
    }
  }, [changeOpen, dndModule, group.isOpen, onOpenChange]);

  const handleContextMenu = useCallback(() => {
    onContextMenu?.();
  }, [onContextMenu]);

  // group이 변경되면 open/close 상태를 업데이트
  useEffect(() => {
    // 모든 자식이 check되었는지를 확인하여 그렇다면 group을 닫음
    const newIsAllChildChecked = group.children.every(r => r.state === "accomplished");
    if (!isAllChildChecked && newIsAllChildChecked) {
      setIsAllChildChecked(true);
      changeOpen(false);
    }
    else if (!newIsAllChildChecked) {
      setIsAllChildChecked(false);
    }

    // group의 자식이 있는지 확인하여 하나도 없다면 닫음
    if (group.children.length === 0 && group.isOpen) {
      changeOpen(false);
    }
  }, [group.name, group.isOpen, group.children, isAllChildChecked, onOpenChange, changeOpen]);

  const backgroundColor = dndModule && dndModule.preDragState === "ready" ? STYLES.palette.accent : undefined;

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={group.isOpen}
      onChange={debouncedHandleExpandChange}
      css={{
        backgroundColor: STYLES.palette.background,
        "&::before": {
          display: "none",
        },
      }}
    >
      <div
        ref={dndModule?.droppable}
        css={{
          position: "relative",
          backgroundColor,
        }}
      >
        <AccordionSummary
          component={'div'}
          expandIcon={<ObsidianIcon icon='chevron-right' />}
          css={{
            paddingRight: 0,
            paddingLeft: drNodeStyle.paddingLeft,
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
          <DrNodeFlexContainer excludePadding>
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
                cancel={useCancelLine ? isAllChildChecked : false}
                faded={group.children.length === 0}
              />
            </Touchable>
            <OptionIconsContainer icons={optionIcons} />
          </DrNodeFlexContainer>
        </AccordionSummary>
        {dndModule && <Indicator dndCase={dndModule.dndCase} depth={0} />}
      </div>
      <AccordionDetails css={{ padding: "0" }}>
        {children(group, depth)}
      </AccordionDetails>
    </Accordion>
  )
}