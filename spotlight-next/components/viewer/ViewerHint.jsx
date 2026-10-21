"use client";

// One-finger-drag hint. `touch` switches the wording; `showHand` shows the
// hand-with-rotation glyph for a few seconds on first view.
export function HandGlyph() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 30c-2-1-3-3-2.5-5C7 20 12 16 17 13" />
      <path d="M40 30c2-1 3-3 2.5-5-.8-3-3-6-6-8" opacity=".6" />
      <path d="M17 26v-4a2 2 0 0 1 4 0v3m0-6a2 2 0 0 1 4 0v6m0-4a2 2 0 0 1 4 0v5c0 5-3 9-8 9-4 0-6-2-8-5l-3-5a2 2 0 0 1 3-2l2 2" />
    </svg>
  );
}

export default function ViewerHint({ touch, showHand }) {
  return (
    <div className="vv-hintwrap">
      {showHand && (
        <div className="vv-hand" aria-hidden="true">
          <HandGlyph />
        </div>
      )}
      <p className="vv-hint">{touch ? "DRAG TO ROTATE · PINCH TO ZOOM" : "DRAG TO ROTATE · SCROLL TO ZOOM"}</p>
    </div>
  );
}
