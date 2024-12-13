/** @jsxImportSource @emotion/react */
import { useLeaf } from "@shared/view/use-leaf";
import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { TaskElDragItem } from '../dnd/drag-item';
import { TEXT_CSS } from "@shared/constants/text-style";
import { css } from "@emotion/react";


const textStyle = css([TEXT_CSS.description, {
  color: "var(--color-base-00)",
}])

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

    const previewWidth = 300;
    const previewHeight = 50;
    
    const { x: x_viewport, y: y_viewport } = currentOffset;
    // @ts-ignore
    // const appEl = plugin().app.dom.appContainerEl;
    const leafEl = leaf.view.containerEl;
    const x_leaf = x_viewport - (window.innerWidth - leafEl.clientWidth);
    const y_leaf = y_viewport - (window.innerHeight - leafEl.clientHeight);
    
    const getTransform = (backend: "html5" | "touch") => {
      return `translate(${x_leaf - previewWidth/2}px, ${y_leaf - previewHeight}px)`;
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
        <div css={textStyle}>{item.el.elementType}</div>
        <div css={textStyle}>{item.el.name}</div>
      </div>
    </div>
  )
}