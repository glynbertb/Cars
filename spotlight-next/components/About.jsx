"use client";
import { useEffect, useRef, useState } from "react";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1400);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <b ref={ref}>{v.toLocaleString()}{suffix}</b>;
}

const STATS = [
  ["07", "Machines featured", 7, ""],
  ["06", "Brands", 6, ""],
  ["120K", "Views", 120, "K"],
];

const STEPS = [
  ["01", "Browse", "Sweep the gallery and the hero carousel. Seven machines, zero filler."],
  ["02", "Save to garage", "Tap the heart to park favourites in your personal garage."],
  ["03", "Experience in 3D", "Open any machine in the interactive viewer — orbit, zoom, inspect."],
];

export default function About() {
  return (
    <div>
      <p className="mission">
        Spotlight is a curated showcase of cars and big bikes — seven machines at a time,
        photographed and modelled like museum pieces, tuned like race bikes. No noise, just the good stuff.
      </p>
      <div className="stats">
        {STATS.map(([label, sub, to, suf]) => (
          <div key={label}><Counter to={to} suffix={suf} /><span>{sub}</span></div>
        ))}
      </div>
      <div className="steps">
        {STEPS.map(([n, t, d]) => (
          <div key={n} className="step"><span className="snum">{n}</span><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>
    </div>
  );
}
