"use client";
import { useEffect, useMemo, useState } from "react";
import { ITEMS } from "../lib/models";
import { SPECS } from "../data/vehicles";
import { Heart } from "./Gallery";

const KEY = "spotlight-garage-v1";

export function loadGarage() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function Bar({ label, value, max, unit, invert }) {
  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div className="spec">
      <div className="spec-h"><span>{label}</span><b>{value}{unit}</b></div>
      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function SpecCard({ it, saved, onToggleSave, onCompare, inCompare }) {
  const sp = SPECS[it.id] || { hp: 0, zero: 0, speed: 0, kg: 0 };
  return (
    <article className="gcard">
      <div className="gimg mini">
        <span className="gnum">{it.id}</span>
        <Heart saved={!!saved[it.id]} onToggle={() => onToggleSave(it)} label={saved[it.id] ? `Remove ${it.name}` : `Save ${it.name}`} />
      </div>
      <div className="gmeta">
        <div className="grow"><h3>{it.name}</h3></div>
        <p>{it.year} · {it.cat}</p>
        <Bar label="Power" value={sp.hp} max={1800} unit=" hp" />
        <Bar label="0–100 km/h" value={sp.zero} max={4} unit=" s" invert />
        <Bar label="Top speed" value={sp.speed} max={445} unit=" km/h" />
        <Bar label="Weight" value={sp.kg} max={2100} unit=" kg" invert />
        <label className="cmp-check">
          <input type="checkbox" checked={inCompare} onChange={onCompare} aria-label={`Compare ${it.name}`} /> Compare
        </label>
      </div>
    </article>
  );
}

function Compare({ ids }) {
  const cars = ids.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean);
  if (cars.length < 2) return <p className="note">Pick at least 2 machines to compare (up to 3).</p>;
  const rows = [
    ["Power (hp)", (it) => SPECS[it.id].hp, "max", ""],
    ["0–100 (s)", (it) => SPECS[it.id].zero, "min", "s"],
    ["Top speed (km/h)", (it) => SPECS[it.id].speed, "max", ""],
    ["Weight (kg)", (it) => SPECS[it.id].kg, "min", "kg"],
  ];
  return (
    <div className="cmp-table" role="table" aria-label="Comparison">
      <div className="cmp-row cmp-head"><span />{cars.map((c) => <b key={c.id}>{c.name}</b>)}</div>
      {rows.map(([label, fn, mode, unit]) => {
        const vals = cars.map(fn);
        const best = mode === "max" ? Math.max(...vals) : Math.min(...vals);
        const max = Math.max(...vals);
        return (
          <div className="cmp-row" key={label}>
            <span className="cmp-label">{label}</span>
            {cars.map((c, i) => (
              <div key={c.id} data-car={c.name} className={vals[i] === best ? "win" : ""}>
                <b>{vals[i]}{unit ? ` ${unit}` : ""}</b>
                <div className="bar"><i style={{ width: `${(vals[i] / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ApiSearch({ saved, onToggleSave }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [state, setState] = useState("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); setState("idle"); setErr(""); return; }
    const ctl = new AbortController();
    setState("loading");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Search failed");
        setRes(d.results || []);
        setState("done");
      } catch (e) {
        if (!ctl.signal.aborted) { setErr(e.message); setState("error"); }
      }
    }, 350);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  return (
    <div className="apisearch">
      <label htmlFor="gs">Look up any car or bike (API Ninjas)</label>
      <input id="gs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Civic, Ninja, Mustang" autoComplete="off" />
      {state === "loading" && <p className="note">Searching…</p>}
      {state === "error" && <p className="note err">{err}</p>}
      {state === "done" && res.length === 0 && <p className="note">No results for “{q}”. Try a make like “Honda”.</p>}
      {state === "done" && res.length > 0 && (
        <ul className="apilist">
          {res.slice(0, 6).map((v) => {
            const fake = { id: v.id, name: `${v.maker} ${v.name}`, year: v.year, cat: v.type === "bike" ? "Superbike" : "Car", kind: v.type };
            const isSaved = !!saved[v.id];
            return (
              <li key={v.id}>
                <div><b>{v.maker} {v.name}</b><span>{v.year} · {v.type}</span></div>
                <button className={isSaved ? "btn-ghost on" : "btn-ghost"} onClick={() => onToggleSave(fake)} aria-pressed={isSaved}>
                  {isSaved ? "Saved ✓" : "+ Garage"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Garage({ saved, onToggleSave }) {
  const [cmp, setCmp] = useState([]);
  const mine = useMemo(() => ITEMS.filter((i) => saved[i.id]), [saved]);
  const extra = useMemo(() => Object.entries(saved).filter(([id]) => !ITEMS.some((i) => i.id === id)).map(([id, v]) => ({ id, ...v })), [saved]);

  const toggleCmp = (id) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));

  return (
    <div>
      {mine.length === 0 && extra.length === 0 ? (
        <div className="empty">
          <p>Your garage is empty — tap the heart on any machine to park it here.</p>
          <a className="btn-white" href="#gallery">Browse the gallery</a>
        </div>
      ) : (
        <>
          <div className="grid-cards">
            {mine.map((it) => (
              <SpecCard key={it.id} it={it} saved={saved} onToggleSave={onToggleSave} inCompare={cmp.includes(it.id)} onCompare={() => toggleCmp(it.id)} />
            ))}
          </div>
          {extra.length > 0 && (
            <ul className="apilist">
              {extra.map((v) => (
                <li key={v.id}>
                  <div><b>{v.name}</b><span>{v.year} · {v.cat}</span></div>
                  <button className="btn-ghost" onClick={() => onToggleSave(v)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
          <h3 className="sub-h">Compare <small>(up to 3)</small></h3>
          <Compare ids={cmp} />
        </>
      )}
      <h3 className="sub-h">Search &amp; add</h3>
      <ApiSearch saved={saved} onToggleSave={onToggleSave} />
    </div>
  );
}
