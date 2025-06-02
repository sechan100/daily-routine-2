/** @jsxImportSource @emotion/react */
import { NoteRoutineGroup } from "@/entities/note";
import { CancelLineName, checkableConfig, CheckableFlexContainer, DragHandleMenu } from "@/features/checkable";
import { Icon } from "@/shared/components/Icon";
import { BaseDndable } from "@/shared/dnd/Dndable";
import { DndData } from "@/shared/dnd/drag-data";
import { useDnd } from "@/shared/dnd/use-dnd";
import { useLeaf } from "@/shared/view/use-leaf";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses } from "@mui/material";
import { useCallback } from "react";
import { useIndicator } from "../model/indicator-store";
import { useRoutineTreeStore } from "../model/routine-tree-store";
import { renderRoutineTree } from "./render-routine-tree";



const dndData: DndData = {
  isFolder: false,
  isOpen: false,
}

type Props = {
  group: NoteRoutineGroup;
  depth: number;
}
export const RoutineGroupItem = ({
  group,
  depth,
}: Props) => {
  const bgColor = useLeaf(s => s.leafBgColor);
  const { open } = useRoutineTreeStore(s => s.actions);

  const {
    dndRef,
    dragHandleRef,
    attributes,
    listeners,
    isDragging,
    isOver,
    dndCase
  } = useDnd({
    id: group.name,
    dndData,
    useIndicator: useIndicator,
    useDragHandle: true,
  });

  const changeOpen = useCallback((isOpen: boolean) => {
    open(group.name, isOpen);
  }, [open, group.name]);

  const isAllSubTasksChecked = group.routines.every(r => r.state === 'accomplished');

  return (
    <BaseDndable
      dndRef={dndRef}
      dndCase={dndCase}
      isDragging={isDragging}
      isOver={isOver}
      depth={0}
    >
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
        <AccordionSummary
          component={'div'}
          expandIcon={<Icon icon='chevron-right' />}
          css={{
            padding: checkableConfig.padding,
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
              dragHandleRef={dragHandleRef}
              attributes={attributes}
              listeners={listeners}
              onClick={e => e.stopPropagation()}
            />
          </CheckableFlexContainer>
        </AccordionSummary>
        <AccordionDetails css={{ padding: "0" }}>
          {group.routines.map(r => renderRoutineTree(r, depth + 1))}
        </AccordionDetails>
      </Accordion>
    </BaseDndable >
  )
}