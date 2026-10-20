"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GARAGE } from "../../lib/garage";
import SiteNav from "../../components/SiteNav";
import Viewer from "../../components/Viewer";


const pad = (n) => String(n).padStart(2, "0");
const fmt = (n) => n.toLocaleString("en-US");
const SWATCHES = ["#d62828", "#1f5eff", "#f07a1a", "#f2c230", "#2f6b4f", "#16181d", "#e9edf2"];
const PATH = {
  cube: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 9l8-4.5M12 12v9M12 12L4 7.5",
  palette: "M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-5-4-11-8-11z",
  down: "M12 4v11m0 0l-4-4m4 4l4-4M5 20h14",
  cal: "M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zm-1 5h16M8 3v4m8-4v4",
};
const Ico = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const ROWS = [
  ["Power", (v) => v.hp, "hp", 1, 0],
  ["Top speed", (v) => v.speed, "km/h", 1, 0],
  ["0–100 km/h", (v) => v.zero, "s", -1, 2],
  ["Weight", (v) => v.kg, "kg", -1, 0],
  ["Power / weight", (v) => v.hp / v.kg, "hp/kg", 1, 2],
];

function Photo({ v, className = "" }) {
  const [bad, setBad] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setBad(true); }, []);
  return (
    <div className={`gx-photo ${className}`} style={{ "--c": v.color }}>
      {!bad && <img ref={ref} src={`/images/garage/${v.id}.jpg`} alt={v.name} onError={() => setBad(true)} />}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="gx-ov" onClick={onClose}>
      <div className="gx-modal" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header><h3>{title}</h3><button onClick={onClose} aria-label="Close">✕</button></header>
        {children}
      </div>
    </div>
  );
}

function Compare({ items }) {
  if (items.length < 2) return <p className="gx-note">Tick at least two machines to compare.</p>;
  return (
    <div>
      {ROWS.map(([label, get, unit, dir, d]) => {
        const vals = items.map(get);
        const best = dir > 0 ? Math.max(...vals) : Math.min(...vals);
        const max = Math.max(...vals);
        return (
          <div key={label} className="gx-row">
            <h4>{label}</h4>
            {items.map((v, i) => (
              <div key={v.id} className={vals[i] === best ? "best" : ""}>
                <span>{v.name}</span>
                <div className="gx-bar"><i style={{ width: `${Math.max(6, (dir > 0 ? vals[i] / max : best / vals[i]) * 100)}%` }} /></div>
                <b>{vals[i].toFixed(d)} <small>{unit}</small></b>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Tour({ v }) {
  const [done, setDone] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const a = JSON.parse(localStorage.getItem("spotlight:tours") || "[]");
      localStorage.setItem("spotlight:tours", JSON.stringify([...a, { ...f, vehicle: v.id }]));
    } catch {}
    setDone(f);
  };
  if (done) return <p className="gx-note">You're booked, {done.name}. Studio tour for the {v.name} on {done.date} at {done.time}.</p>;
  return (
    <form onSubmit={submit} className="gx-form">
      <label>Name<input name="name" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Date<input name="date" type="date" required /></label>
      <label>Time<select name="time"><option>10:00</option><option>13:00</option><option>16:00</option></select></label>
      <button className="gx-primary">Confirm tour</button>
    </form>
  );
}

export default function GaragePage() {
  const [saved, setSaved] = useState(GARAGE.map((v) => v.id));
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState("panigale");
  const [cmp, setCmp] = useState(["nevera", "jesko"]);
  const [modal, setModal] = useState(null);
  const [livery, setLivery] = useState({});
  const [view, setView] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("spotlight:garage"));
      if (Array.isArray(s)) setSaved(s.filter((id) => GARAGE.some((v) => v.id === id)));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("spotlight:garage", JSON.stringify(saved)); } catch {}
  }, [saved, ready]);

  const list = useMemo(() => GARAGE.filter((v) => saved.includes(v.id)), [saved]);
  const cur = list.find((v) => v.id === active) || list[0];
  const idx = cur ? list.findIndex((v) => v.id === cur.id) : 0;
  const rank = cur ? [...list].sort((a, b) => a.zero - b.zero).findIndex((v) => v.id === cur.id) + 1 : 0;
  const maxSpeed = Math.max(...list.map((v) => v.speed), 1);
  const color = cur ? livery[cur.id] || cur.color : "#fff";

  const toggle = (id) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  const remove = (id) => { setSaved((s) => s.filter((x) => x !== id)); setCmp((c) => c.filter((x) => x !== id)); };
  const open3D = () => {
    const rect = heroRef.current.getBoundingClientRect();
    setView({
      rect,
      item: { id: cur.id, name: cur.name, kind: cur.kind, h: 1, r: cur.kind === "car" ? 0.4 : undefined, year: cur.year, cat: cur.cat, score: "—", color, tint: "#223247" },
    });
  };

  return (
    <div className="gx-wrap">
      <SiteNav />
      <main className="gx-main">
        <section className="gx-head">
          <div>
            <span className="gx-pill"><i />Personal vault / Vol. 01</span>
            <h1>Your saved <em>machines</em></h1>
          </div>
          <p>Every machine you bookmark lands here, staged, measured and ready to compare side by side.</p>
        </section>

        {!cur ? (
          <div className="gx-empty">Your garage is empty. <Link href="/">Browse the gallery</Link> and save a few machines.</div>
        ) : (
          <div className="gx-grid">
            <aside className="gx-side">
              <div className="gx-side-h"><span>Saved</span><span>{pad(list.length)}</span></div>
              <ul>
                {list.map((v) => (
                  <li key={v.id} className={v.id === cur.id ? "on" : ""}>
                    <button className="gx-item" onClick={() => setActive(v.id)}>
                      <Photo v={v} className="gx-th" />
                      <span className="gx-txt">
                        <b>{v.name}</b>
                        <small>{v.year} · {fmt(v.hp)} hp</small>
                        <span className="gx-tags">{v.tags.map((t) => <em key={t}>{t}</em>)}</span>
                      </span>
                    </button>
                    <label className="gx-chk">
                      <input type="checkbox" checked={cmp.includes(v.id)} onChange={() => toggle(v.id)} />
                      <i /><span>Compare</span>
                    </label>
                    <button className="gx-x" onClick={() => remove(v.id)} aria-label={`Remove ${v.name}`}>✕</button>
                  </li>
                ))}
              </ul>
              <div className="gx-cmpbar">
                <span>{cmp.length} selected</span>
                <button onClick={() => setModal("compare")} disabled={cmp.length < 2}>Compare →</button>
              </div>
            </aside>

            <section className="gx-detail">
              <div className="gx-hero" ref={heroRef}>
                <Photo key={cur.id} v={cur} className="gx-hero-img" />
                <div className="gx-hero-t">
                  <h2>{cur.name} <i className="gx-dot" style={{ background: color }} /></h2>
                  <p>{cur.year} · {cur.cat} · {cur.origin}</p>
                </div>
                <span className="gx-idx">{pad(idx + 1)} / {pad(list.length)}</span>
              </div>
              <div className="gx-stats">
                <div><h5>Engine</h5><strong>{cur.engine}</strong><p>{cur.engineSub}</p></div>
                <div>
                  <h5>Top speed</h5>
                  <strong>{cur.speed}<small>km/h</small></strong>
                  <div className="gx-line"><i style={{ width: `${(cur.speed / maxSpeed) * 100}%` }} /></div>
                </div>
                <div>
                  <h5>0–100 km/h</h5>
                  <div className="gx-ring">
                    <svg viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" />
                      <circle className="v" cx="60" cy="60" r="52" style={{ strokeDashoffset: 327 * (1 - (list.length - rank + 1) / list.length) }} />
                    </svg>
                    <div><strong>{cur.zero}<small>s</small></strong><p>#{rank} of {list.length} in vault</p></div>
                  </div>
                </div>
                <div>
                  <h5>Power / weight</h5>
                  <strong>{(cur.hp / cur.kg).toFixed(2)}<small>hp/kg</small></strong>
                  <p>{cur.hp} hp · {cur.kg} kg</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {cur && (
        <nav className="gx-dock" aria-label="Vehicle actions">
          <button onClick={open3D}><Ico d={PATH.cube} />3D Model Viewer</button>
          <button onClick={() => setModal("livery")}><Ico d={PATH.palette} />Configure Livery</button>
          <button onClick={() => window.print()}><Ico d={PATH.down} />Export Spec Sheet PDF</button>
          <button className="main" onClick={() => setModal("tour")}><Ico d={PATH.cal} />Schedule Studio Tour</button>
        </nav>
      )}

      {modal === "compare" && (
        <Modal title="Compare" onClose={() => setModal(null)}>
          <Compare items={list.filter((v) => cmp.includes(v.id))} />
        </Modal>
      )}
      {modal === "livery" && cur && (
        <Modal title={`Livery · ${cur.name}`} onClose={() => setModal(null)}>
          <div className="gx-sw">
            {SWATCHES.map((c) => (
              <button key={c} style={{ background: c }} className={color === c ? "on" : ""} aria-label={`Colour ${c}`}
                onClick={() => setLivery((l) => ({ ...l, [cur.id]: c }))} />
            ))}
          </div>
          <p className="gx-note">The colour is applied to the model in the 3D viewer.</p>
        </Modal>
      )}
      {modal === "tour" && cur && (
        <Modal title={`Studio tour · ${cur.name}`} onClose={() => setModal(null)}><Tour v={cur} /></Modal>
      )}
      {view && <Viewer item={view.item} rect={view.rect} onClose={() => setView(null)} />}
    </div>
  );
}