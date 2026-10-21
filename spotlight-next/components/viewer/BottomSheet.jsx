"use client";
import { useRef, useState } from "react";

// Mobile bottom sheet. Drag the handle up to reveal more (paint + description),
// down to collapse so the 3D model stays visible. Snaps to two detents.
export default function BottomSheet({ expanded, onExpandChange, children, extra }) {
  const sheetRef = useRef(null);
  const drag = useRef(null);
  const [dy, setDy] = useState(0);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const d = e.clientY - drag.current.y;
    if (Math.abs(d) > 6) drag.current.moved = true;
    // Drag up (negative) only when collapsed; drag down (positive) to collapse.
    setDy(expanded ? Math.max(0, d) : Math.min(0, d));
  };
  const onPointerEnd = () => {
    if (!drag.current) return;
    const d = dy;
    drag.current = null;
    setDy(0);
    if (!expanded && d < -60) onExpandChange(true);
    else if (expanded && d > 60) onExpandChange(false);
  };

  return (
    <div
      ref={sheetRef}
      className={`vv-sheet${expanded ? " open" : ""}`}
      style={dy ? { transform: `translateY(${dy * 0.4}px)` } : undefined}
    >
      <div
        className="vv-grip"
        role="slider"
        tabIndex={0}
        aria-label="Details sheet size"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={expanded ? 1 : 0}
        aria-valuetext={expanded ? "Expanded" : "Collapsed"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            onExpandChange(e.key === "ArrowUp");
          }
        }}
        onClick={(e) => {
          if (drag.current?.moved) return;
          if (e.target === e.currentTarget || e.target.classList?.contains("vv-gripbar")) {
            onExpandChange(!expanded);
          }
        }}
      >
        <span className="vv-gripbar" aria-hidden="true" />
      </div>
      <div className="vv-sheet-body">{children}</div>
      <div className="vv-sheet-extra" aria-hidden={!expanded}>
        {extra}
      </div>
    </div>
  );
}
