/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { CSSProperties, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';
import { Preview } from "react-dnd-preview";
import { TEXT_CSS } from '../colors/text-style';
import { useLeaf } from '../view/use-leaf';
import { BaseDndItem, isBaseDndItem } from "./drag-item";


const textStyle = css([TEXT_CSS.description, {
  color: "var(--color-base-00)",
}])

type DragItemProps = {
  item: BaseDndItem;
  style: React.CSSProperties;
}
const Item = ({
  item,
  style,
}: DragItemProps) => {
  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getClientOffset(),
  }));

  const previewStyle = useMemo<CSSProperties>(() => {
    if (!currentOffset) return { display: 'none' };

    const previewWidth = 300;
    const previewHeight = 50;
    const xOffset = -250;

    const { x: x_viewport, y: y_viewport } = currentOffset;
    // @ts-ignore
    // const appEl = plugin().app.dom.appContainerEl;
    const leafEl = useLeaf.getState().view.containerEl;
    const x_leaf = x_viewport - (window.innerWidth - leafEl.clientWidth) + xOffset;
    const y_leaf = y_viewport - (window.innerHeight - leafEl.clientHeight);

    const transform = `translate(${x_leaf - previewWidth / 2}px, ${y_leaf - previewHeight / 2}px)`;
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
      zIndex: 999,
    };
  }, [currentOffset, style]);

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
        <div css={textStyle}>{item.id}</div>
      </div>
    </div>
  )
}


export const DragItemPreview = () => {
  return (
    <div className="dr-dnd-preview-context">
      <Preview>
        {({ item, style, itemType }) => {
          if (item && isBaseDndItem(item) && itemType !== "__NATIVE_TEXT__") {
            return (
              <Item
                item={item}
                style={style}
              />
            )
          } else {
            return <></>
          }
        }}
      </Preview>
    </div>
  )
}