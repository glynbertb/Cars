"use client";
import { useEffect, useState } from "react";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [res, setRes] = useState([]);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); setErr(""); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true); setErr("");
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`, { signal: ctl.signal });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Search failed");
        setRes(d.results); setSel(null);
      } catch (e) { if (!ctl.signal.aborted) setErr(e.message); }
      finally { if (!ctl.signal.aborted) setBusy(false); }
    }, 350);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q, type]);

  return (
    <>
      <button className="srbtn" onClick={() => setOpen(true)}>Search · Ctrl K</button>
      {open && (
        <div className="srov" onClick={() => setOpen(false)}>
          <div className="srbox" role="dialog" aria-label="Search vehicles" onClick={(e) => e.stopPropagation()}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a make or model, e.g. Ducati, Civic, Ninja" />
            <div className="srtabs">
              {[["", "All"], ["car", "Cars"], ["bike", "Big bikes"]].map(([v, l]) => (
                <button key={l} className={type === v ? "on" : ""} onClick={() => setType(v)}>{l}</button>
              ))}
            </div>
            <div className="srbody">
              <ul className="srlist">
                {busy && <li className="sp-note">Searching…</li>}
                {err && <li className="sp-note">{err}</li>}
                {!busy && !err && q.trim().length >= 2 && res.length === 0 && <li className="sp-note">No results.</li>}
                {res.map((v) => (
                  <li key={v.id}>
                    <button className={sel?.id === v.id ? "on" : ""} onClick={() => setSel(v)}>
                      <b>{v.maker} {v.name}</b><span>{v.year} · {v.type === "bike" ? "Bike" : "Car"}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {sel && (
                <div className="srdet">
                  <p className="sp-maker">{sel.maker} · {sel.year}</p>
                  <h3>{sel.name}</h3>
                  <div className="sp-stats">
                    {sel.stats.map((s) => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}
                  </div>
                  {sel.groups.map((g) => (
                    <section key={g.title}><h4>{g.title}</h4>
                      <dl>{g.rows.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}</dl>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}