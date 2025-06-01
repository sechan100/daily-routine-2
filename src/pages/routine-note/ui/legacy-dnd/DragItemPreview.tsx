/** @jsxImportSource @emotion/react */
import { TEXT_CSS } from "@/shared/components/text-style";
import { useLeaf } from "@/shared/view/use-leaf";
import { css } from "@emotion/react";
import { CSSProperties, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';
import { DragItem } from './drag-item';


const textStyle = css([TEXT_CSS.description, {
  color: "var(--color-base-00)",
}])

interface TaskPreviewProps {
  item: DragItem;
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

    const previewWidth = 300;
    const previewHeight = 50;

    const { x: x_viewport, y: y_viewport } = currentOffset;
    // @ts-ignore
    // const appEl = plugin().app.dom.appContainerEl;
    const leafEl = leaf.view.containerEl;
    const x_leaf = x_viewport - (window.innerWidth - leafEl.clientWidth);
    const y_leaf = y_viewport - (window.innerHeight - leafEl.clientHeight);

    const getTransform = (backend: "html5" | "touch") => {
      return `translate(${x_leaf - previewWidth / 2}px, ${y_leaf - previewHeight}px)`;
    }
    const transform = getTransform(backend);
    return {
      ...style,
      width: previewWidth,
      height: previewHeight,
      backgroundColor: "transparent",
      transform,
      WebkitTransform: transform,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
  }, [backend, currentOffset, leaf.view.containerEl, style]);

  const name = useMemo(() => {
    switch (item.type) {
      case "task":
        return item.task.name;
      case "routine":
        return item.routine.name;
      case "group":
        return item.group.name;
      default:
        return "Unknown Element";
    }
  }, [item]);

  return (
    <div style={previewStyle}>
      <div css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        borderRadius: "5px",
        padding: "5px 5px",
        width: "fit-content",
        opacity: 0.9,
        backgroundColor: "var(--color-base-100)",
        boxShadow: "0 0 0.5em 0.5em rgba(0, 0, 0, 0.2)",
        color: "var(--color-base-00)",
      }}>
        <div css={textStyle}>{name}</div>
      </div>
    </div>
  )
}