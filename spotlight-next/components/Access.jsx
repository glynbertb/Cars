"use client";
import { useState } from "react";

const TIERS = [
  { name: "Rider", price: "Free", feats: ["Garage (7 slots)", "Editorial access", "Monthly drops"], hot: false },
  { name: "Driver", price: "$9/mo", feats: ["Unlimited garage", "Compare tool", "Early 3D models", "No ads"], hot: true },
  { name: "Collector", price: "$29/mo", feats: ["Everything in Driver", "Print yearly book", "Track-day invites"], hot: false },
];

export default function Access() {
  const [f, setF] = useState({ name: "", email: "", fav: "car" });
  const [errs, setErrs] = useState({});
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "Enter your name (2+ characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = "Enter a valid email address.";
    if (f.fav !== "car" && f.fav !== "bike") er.fav = "Pick car or bike.";
    setErrs(er);
    if (Object.keys(er).length) return;
    setState("loading");
    setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), fav: f.fav }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong");
      setState("ok");
      setMsg(d.message);
    } catch (e2) {
      setState("error");
      setMsg(e2.message);
    }
  };

  const field = (k, label, input) => (
    <label>{label}{input}
      {errs[k] && <span className="ferr" role="alert">{errs[k]}</span>}
    </label>
  );

  return (
    <div>
      <div className="tiers">
        {TIERS.map((t) => (
          <div key={t.name} className={`tier${t.hot ? " hot" : ""}`}>
            {t.hot && <span className="hot-badge">Most popular</span>}
            <h3>{t.name}</h3>
            <p className="price">{t.price}</p>
            <ul>{t.feats.map((x) => <li key={x}>{x}</li>)}</ul>
            <a className={t.hot ? "btn-white" : "btn-ghost"} href="#signup">Choose {t.name}</a>
          </div>
        ))}
      </div>
      <form id="signup" className="signup" onSubmit={submit} noValidate aria-label="Get access sign-up">
        <h3>Get access</h3>
        {field("name", "Name",
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Alex Rossi" autoComplete="name" />)}
        {field("email", "Email",
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="alex@example.com" autoComplete="email" />)}
        {field("fav", "Favorite type",
          <select value={f.fav} onChange={(e) => setF({ ...f, fav: e.target.value })}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>)}
        <button className="btn-white" type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Joining…" : "Join Spotlight →"}
        </button>
        {state === "ok" && <p className="fok" role="status">{msg}</p>}
        {state === "error" && <p className="ferr" role="alert">{msg}</p>}
      </form>
      <footer className="sitefoot">
        <a className="logo" href="#home"><i /> Spotlight <b /></a>
        <nav aria-label="Footer">
          {["home", "gallery", "garage", "editorial", "about", "access"].map((s) => (
            <a key={s} href={`#${s}`}>{s[0].toUpperCase() + s.slice(1)}</a>
          ))}
        </nav>
        <div className="socials">
          <a href="#home" aria-label="X">𝕏</a>
          <a href="#home" aria-label="Instagram">◎</a>
          <a href="#home" aria-label="YouTube">▷</a>
        </div>
        <p>© 2026 Spotlight. Cars &amp; big bikes, framed in light. <a href="#home">Back to top ↑</a></p>
      </footer>
    </div>
  );
}
