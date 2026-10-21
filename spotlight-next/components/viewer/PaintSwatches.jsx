"use client";

// Paint swatch row. Hidden entirely when the model exposes no recolorable
// body material (parent renders null in that case).
export default function PaintSwatches({ options, value, onChange, mini }) {
  if (!options || options.length === 0) return null;
  return (
    <div className={`vv-swatches${mini ? " mini" : ""}`} role="group" aria-label="Paint color">
      {options.map((p) => (
        <button
          key={p.hex}
          className={`vv-sw${value === p.hex ? " on" : ""}`}
          style={{ background: p.hex }}
          title={p.name}
          aria-label={`Paint ${p.name}`}
          aria-pressed={value === p.hex}
          onClick={() => onChange(value === p.hex ? "" : p.hex)}
        />
      ))}
    </div>
  );
}
