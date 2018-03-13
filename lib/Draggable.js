import React from "react";

export function Draggable({
  children,
  onDrag,
  onDragStart,
  onDragEnd,
  cursor = "default",
  dragCursor = cursor,
  className = "",
  style = {},
  as = "div"
}) {
  const handler = event => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    const originalX = event.screenX;
    const originalY = event.screenY;

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.bottom = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.cursor = dragCursor;
    overlay.style.zIndex = ~(1 << 31);

    const dragData = {};

    const mouseMove = event => {
      onDrag &&
        onDrag(
          {
            deltaX: event.screenX - originalX,
            deltaY: event.screenY - originalY
          },
          dragData
        );
    };

    const mouseUp = event => {
      overlay.remove();
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      onDragEnd &&
        onDragEnd(
          {
            deltaX: event.screenX - originalX,
            deltaY: event.screenY - originalY
          },
          dragData
        );
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    document.body.appendChild(overlay);

    onDragStart &&
      onDragStart(
        {
          deltaX: 0,
          deltaY: 0
        },
        dragData
      );
  };
  const Element = as;
  return (
    <Element className={className} style={{ cursor, ...style }} onMouseDown={handler}>
      {children}
    </Element>
  );
}
