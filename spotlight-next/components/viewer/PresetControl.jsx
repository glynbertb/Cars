"use client";
import { useRef } from "react";

// Segmented camera preset control. Keyboard-operable radiogroup:
// Left/Right (and Up/Down) move between presets, Home/End jump.
export default function PresetControl({ presets, value, onChange, label = "Camera angle" }) {
  const btnRefs = useRef([]);

  const move = (from, dir) => {
    const next = (from + dir + presets.length) % presets.length;
    onChange(presets[next]);
    btnRefs.current[next]?.focus();
  };

  return (
    <div
      className="vv-presets"
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => {
        const i = presets.indexOf(value);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(i, 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(i, -1);
        } else if (e.key === "Home") {
          e.preventDefault();
          onChange(presets[0]);
          btnRefs.current[0]?.focus();
        } else if (e.key === "End") {
          e.preventDefault();
          onChange(presets[presets.length - 1]);
          btnRefs.current[presets.length - 1]?.focus();
        }
      }}
    >
      {presets.map((p, i) => (
        <button
          key={p}
          ref={(el) => (btnRefs.current[i] = el)}
          role="radio"
          aria-checked={value === p}
          tabIndex={value === p ? 0 : -1}
          className={value === p ? "on" : ""}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
