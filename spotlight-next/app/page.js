"use client";
import { useEffect, useRef, useState } from "react";
import { ITEMS, renderThumb } from "../lib/models";
import Viewer from "../components/Viewer";
import BackgroundVideo from "../components/BackgroundVideo";
import MusicToggle from "../components/MusicToggle";
import SearchModal from "../components/SearchModal";
import Link from "next/link";

const n = ITEMS.length;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function Page() {
  const [pos, setPos] = useState(1);
  const [drag, setDrag] = useState(false);
  const [thumbs, setThumbs] = useState({});
  const [view, setView] = useState(null);
  const [gap, setGap] = useState(210);
  const st = useRef({ x: 0, p: 0, moved: 0 });
  const active = clamp(Math.round(pos), 0, n - 1);
  const cur = ITEMS[active];
  const go = (d) => setPos((p) => clamp(Math.round(p) + d, 0, n - 1));

  useEffect(() => {
    const f = () => setGap(innerWidth < 700 ? 130 : 210);
    f(); addEventListener("resize", f); return () => removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    let dead = false;
    (async () => {
      for (const it of ITEMS) {
        if (dead) return;

        if (it.img) {
          setThumbs((t) => ({ ...t, [it.id]: it.img }));
          continue;
        }

        await new Promise((r) => setTimeout(r, 30));
        if (dead) return;
        setThumbs((t) => ({ ...t, [it.id]: renderThumb(it) }));
      }
    })();

    return () => {
      dead = true;
    };
  }, []);

  useEffect(() => {
    const k = (e) => { if (view) return; if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [view]);

  useEffect(() => {
    if (!drag) return;
    const mv = (e) => {
      const dx = e.clientX - st.current.x;
      st.current.moved = Math.max(st.current.moved, Math.abs(dx));
      setPos(clamp(st.current.p - dx / gap, -0.3, n - 0.7));
    };
    const up = () => { setDrag(false); setPos((p) => clamp(Math.round(p), 0, n - 1)); };
    addEventListener("pointermove", mv); addEventListener("pointerup", up);
    return () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
  }, [drag, gap]);

  const open = (e, it, i) => {
    if (st.current.moved > 6) return;
    setPos(i);
    setView({ item: it, rect: e.currentTarget.getBoundingClientRect() });
  };

  return (
    <main>
      
      <BackgroundVideo />
      <MusicToggle />
      <nav className="nav">
        <div className="logo"><i /> Spotlight <b /></div>
        <div className="links"><a href="#">Gallery</a><a href="garage">Garage</a><a href="#">Editorial</a><a href="#">About</a></div>
        <button className="cta">Get access →</button>
      </nav>

      <header className="hero">
        <div className="eyebrow">THE SPOTLIGHT COLLECTION · VOL. 01</div>
        <h1>Selected machines,<br />framed in <em>light</em></h1>
      </header>

      <div className="ghost" aria-hidden>{String(active + 1).padStart(2, "0")}</div>

      <section
        className={`stage${drag ? " drag" : ""}`}
        onPointerDown={(e) => { st.current = { x: e.clientX, p: pos, moved: 0 }; setDrag(true); }}
      >
        {ITEMS.map((it, i) => {
          const o = i - pos, a = Math.abs(o);
          return (
            <button
              key={it.id}
              className={`card${drag ? "" : " ease"}`}
              draggable={false}
              aria-label={`Open ${it.name} in 3D`}
              onClick={(e) => open(e, it, i)}
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

      <div className="hint">DRAG · SWIPE · ARROW KEYS · CLICK TO ENTER 3D</div>

      <footer className="foot">
        <div className="count">{cur.id}<small>/ {String(n).padStart(2, "0")}</small></div>
        <div className="info">
          <h2>{cur.name}</h2>
          <p>{cur.year} · {cur.cat} · <span>★</span> <b>{cur.score}</b></p>
        </div>
        <div className="arrows">
          <button onClick={() => go(-1)} aria-label="Previous">‹</button>
          <button onClick={() => go(1)} aria-label="Next">›</button>
        </div>
      </footer>

      {view && <Viewer item={view.item} rect={view.rect} thumb={thumbs[view.item.id]} onClose={() => setView(null)} />}
    </main>
  );
}
