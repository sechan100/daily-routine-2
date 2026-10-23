/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";
import { isTask, isTaskGroup } from "@entities/note";
import { Icon } from "@shared/components/Icon";
import { useLeaf } from "@shared/view/use-leaf";
import { CSSProperties, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';
import { TaskElDragItem } from '../dnd/drag-item';


// 포인터 위로 띄우는 거리(px). 터치에서는 손가락에 가려지지 않도록 더 띄운다.
const POINTER_GAP = {
  touch: 32,
  html5: 12,
} as const;

const popIn = keyframes({
  from: { opacity: 0, transform: "scale(0.96)" },
  to: { opacity: 1, transform: "scale(1)" },
});

const cardStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5em",
  maxWidth: "min(260px, 70vw)",
  padding: "0.45em 0.8em",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--background-modifier-border)",
  backgroundColor: "var(--background-primary)",
  boxShadow: "var(--shadow-s)",
  color: "var(--text-normal)",
  fontSize: "var(--font-ui-small)",
  lineHeight: "var(--line-height-tight)",
  opacity: 0.95,
  animation: `${popIn} 120ms ease-out`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

const checkboxStyle = css({
  flexShrink: 0,
  width: "12px",
  height: "12px",
  border: "1px solid var(--text-faint)",
  borderRadius: "var(--radius-s)",
});

const nameStyle = css({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const doneNameStyle = css({
  color: "var(--text-muted)",
  textDecoration: "line-through",
});


interface TaskPreviewProps {
  item: TaskElDragItem;
  style: React.CSSProperties;
  backend: "touch" | "html5";
}
export const ElementPreview = ({ item, style, backend }: TaskPreviewProps) => {

  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getClientOffset(),
  }));

  const leaf = useLeaf();

  const previewStyle = useMemo<CSSProperties>(() => {
    if (!currentOffset) return { display: 'none' };

    // preview는 leaf 안에서 fixed로 그려지므로, viewport 좌표를 leaf 기준으로 바꾼다.
    const leafRect = leaf.view.containerEl.getBoundingClientRect();
    const x = currentOffset.x - leafRect.left;
    const y = currentOffset.y - leafRect.top - POINTER_GAP[backend];
    // 포인터 바로 위 가운데에 카드의 아래쪽 가운데가 오도록 놓는다.
    const transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
    return {
      ...style,
      zIndex: "var(--layer-dragged-item)",
      transform,
      WebkitTransform: transform,
    };
  }, [backend, currentOffset, leaf.view.containerEl, style]);

  const el = item.el;
  const isDone = isTask(el) && el.state !== "un-checked";

  return (
    <div style={previewStyle}>
      <div css={cardStyle}>
        {isTaskGroup(el)
          ? <Icon icon="folder" size="14px" color="var(--text-muted)" />
          : <span css={checkboxStyle} />
        }
        <span dir="auto" css={[nameStyle, isDone && doneNameStyle]}>{el.name}</span>
      </div>
    </div>
  )
}
