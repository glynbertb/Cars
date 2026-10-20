"use client";
import { useEffect, useRef, useState } from "react";
import { ITEMS } from "../lib/models";

const n = ITEMS.length;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function Hero({ thumbs }) {
  const [pos, setPos] = useState(1);
  const [drag, setDrag] = useState(false);
  const [gap, setGap] = useState(210);
  const st = useRef({ x: 0, p: 0, moved: 0 });
  const active = clamp(Math.round(pos), 0, n - 1);
  const cur = ITEMS[active];
  const go = (d) => setPos((p) => clamp(Math.round(p) + d, 0, n - 1));

  useEffect(() => {
    const f = () => setGap(innerWidth < 700 ? 128 : 210);
    f();
    addEventListener("resize", f);
    return () => removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    const k = (e) => {
      if (e.target.matches("input,textarea,select")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    if (!drag) return;
    const mv = (e) => {
      const dx = e.clientX - st.current.x;
      st.current.moved = Math.max(st.current.moved, Math.abs(dx));
      setPos(clamp(st.current.p - dx / gap, -0.3, n - 0.7));
    };
    const up = () => { setDrag(false); setPos((p) => clamp(Math.round(p), 0, n - 1)); };
    addEventListener("pointermove", mv);
    addEventListener("pointerup", up);
    return () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
  }, [drag, gap]);

  const select = (e, it, i) => {
    if (st.current.moved > 6) return;
    setPos(i);
  };

  return (
    <div className="hero-wrap">
      <header className="hero">
        <div className="eyebrow">THE SPOTLIGHT COLLECTION · VOL. 01</div>
        <h1>Selected machines,<br />framed in <em>light</em></h1>
      </header>
      <div className="ghost" aria-hidden>{String(active + 1).padStart(2, "0")}</div>
      <section
        className={`stage${drag ? " drag" : ""}`}
        aria-label="Machine carousel"
        onPointerDown={(e) => { st.current = { x: e.clientX, p: pos, moved: 0 }; setDrag(true); }}
      >
        {ITEMS.map((it, i) => {
          const o = i - pos, a = Math.abs(o);
          return (
            <button
              key={it.id}
              className={`card${drag ? "" : " ease"}`}
              draggable={false}
              aria-label={`Show ${it.name}`}
              onClick={(e) => select(e, it, i)}
              style={{
                transform: `translate(-50%,-50%) translateX(${o * gap}px) translateY(${a * a * 7}px) translateZ(${-a * 90}px) rotateY(${-o * 16}deg) rotateZ(${o * 2}deg) scale(${1.14 - Math.min(a, 3) * 0.06})`,
                zIndex: 100 - Math.round(a * 10),
                opacity: a > 4.2 ? 0 : 1,
              }}
            >
              {thumbs[it.id] && <img src={thumbs[it.id]} alt={`${it.name}, ${it.cat}`} draggable={false} />}
              <span className="n">{it.id}</span>
              <span className="t">{it.name}</span>
            </button>
          );
        })}
      </section>
      <div className="hint">DRAG · SWIPE · ARROW KEYS · CLICK TO SELECT</div>
      <footer className="foot">
        <div className="count">{cur.id}<small>/ {String(n).padStart(2, "0")}</small></div>
        <div className="info">
          <h2>{cur.name}</h2>
          <p>{cur.year} · {cur.cat} · <span>★</span> <b>{cur.score}</b></p>
        </div>
        <div className="cap-r" aria-hidden />
      </footer>
    </div>
  );
}
