"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ITEMS } from "../lib/models";
import { SPECS } from "../data/vehicles";

const FILTERS = ["All", "Cars", "Bikes", "Hypercars", "Superbikes"];

export function matches(it, f) {
  if (f === "All") return true;
  if (f === "Cars") return it.kind === "car";
  if (f === "Bikes") return it.kind === "bike";
  if (f === "Hypercars") return it.cat === "Hypercar";
  if (f === "Superbikes") return it.cat === "Superbike";
  return true;
}

export function Heart({ saved, onToggle, label }) {
  return (
    <button
      className={`heart${saved ? " on" : ""}`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-pressed={saved}
      aria-label={label}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2z" />
      </svg>
    </button>
  );
}

export default function Gallery({ thumbs, saved, onToggleSave, onLightbox, onView3D }) {
  const [f, setF] = useState("All");
  const list = ITEMS.filter((it) => matches(it, f));
  return (
    <div>
      <div className="chips" role="tablist" aria-label="Filter machines">
        {FILTERS.map((c) => (
          <button key={c} role="tab" aria-selected={f === c} className={f === c ? "on" : ""} onClick={() => setF(c)}>{c}</button>
        ))}
      </div>
      <div className="grid-cards">
        {list.map((it) => (
          <article key={it.id} className="gcard" onClick={() => onLightbox(it)} onKeyDown={(e) => e.key === "Enter" && onLightbox(it)} tabIndex={0} aria-label={`${it.name} — open preview`}>
            <div className="gimg">
              {thumbs[it.id] ? <img src={thumbs[it.id]} alt={`${it.name}, ${it.cat}`} loading="lazy" /> : <div className="gph" />}
              <Heart saved={!!saved[it.id]} onToggle={() => onToggleSave(it)} label={saved[it.id] ? `Remove ${it.name} from garage` : `Save ${it.name} to garage`} />
            </div>
            <div className="gmeta">
              <div className="grow"><h3>{it.name}</h3><span className="rate">★ {it.score}</span></div>
              <p>{it.year} · {it.cat}</p>
              <div className="gbtns">
                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onView3D(it); }}>View in 3D</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Lightbox({ item, thumbs, onClose, onPrev, onNext, onView3D }) {
  const ref = useRef(null);
  const touch = useRef(0);
  const close = useCallback(onClose, [onClose]);

  useEffect(() => {
    ref.current?.focus();
    const k = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [close, onNext, onPrev]);

  const sp = SPECS[item.id];
  return (
    <div className="lb-ov" onClick={close} role="dialog" aria-modal="true" aria-label={`${item.name} preview`}>
      <div
        className="lb-box" ref={ref} tabIndex={-1} onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current;
          if (dx < -40) onNext();
          if (dx > 40) onPrev();
        }}
      >
        <button className="lb-x" onClick={close} aria-label="Close preview">✕</button>
        <button className="lb-nav l" onClick={onPrev} aria-label="Previous machine">‹</button>
        <button className="lb-nav r" onClick={onNext} aria-label="Next machine">›</button>
        {thumbs[item.id] && <img src={thumbs[item.id]} alt={`${item.name}, ${item.cat}`} />}
        <div className="lb-meta">
          <p className="kicker">{item.id} · {item.cat} · {item.year}</p>
          <h3>{item.name}</h3>
          <p className="lb-sub">★ {item.score}{sp ? ` · ${sp.hp} hp · ${sp.zero}s 0–100 · ${sp.speed} km/h` : ""}</p>
          <button className="btn-white" onClick={() => onView3D(item)}>View in 3D</button>
        </div>
      </div>
    </div>
  );
}
