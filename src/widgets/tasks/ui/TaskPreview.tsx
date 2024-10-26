/** @jsxImportSource @emotion/react */
import { Task as TaskEntity } from 'entities/note';
import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { Icon } from 'shared/components/Icon';
import { dr } from 'shared/daily-routine-bem';
import { Checkbox } from './Checkbox';
import { TaskName } from './TaskName';
import { DragItem } from '../hooks/use-task-dnd';
import { plugin } from 'shared/plugin-service-locator';
import { useLeaf } from 'shared/view/react-view';



interface TaskPreviewProps {
  item: DragItem;
  style: React.CSSProperties;
  backend: "touch" | "html5";
}
export const TaskPreview = ({ item, style, backend }: TaskPreviewProps) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getSourceClientOffset(),
  }));

  const leaf = useLeaf();

  const previewStyle = useMemo<CSSProperties>(() => {
    if (!currentOffset) return { display: 'none' };
    
    const { x: x_viewport, y: y_viewport } = currentOffset;
    // @ts-ignore
    const appEl = plugin().app.dom.appContainerEl;
    const leafEl = leaf.view.containerEl;
    const x_leaf = x_viewport - (appEl.clientWidth - leafEl.clientWidth);
    const y_leaf = y_viewport - (appEl.offsetHeight - leafEl.clientHeight);

    const taksWidth = item.width;
    const getTransform = (backend: "html5" | "touch") => {
      if(backend === "html5") {
        return `translate(${x_leaf - (taksWidth - item.dragHandleWidth)}px, ${y_leaf}px)`;
      } else {
        return `translate(${x_leaf - (taksWidth - item.dragHandleWidth)}px, ${y_leaf}px)`;
      }
    }
    const transform = getTransform(backend);
    return {
      ...style,
      backgroundColor: "var(--background-primary)",
      boxShadow: "0 0 0.5em 0.5em rgba(0, 0, 0, 0.2)",
      transform,
      WebkitTransform: transform,
      width: taksWidth,
    };
  }, [backend, currentOffset, item, leaf.view.containerEl, style]);

  useEffect(() => {
    if(!previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const preview = item.previewSource.cloneNode(true) as HTMLElement;
    preview.removeClass("dr-task--dragging");
    container.appendChild(preview);

    return () => {
      container.removeChild(preview);
    }
  }, [item.previewSource])

  return (
    <div
      ref={previewContainerRef}
      style={previewStyle}
    />
  )
}