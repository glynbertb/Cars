"use client";
import { useEffect, useState } from "react";

const LINKS = [
  ["Gallery", "#gallery"],
  ["Garage", "#garage"],
  ["Editorial", "#editorial"],
  ["About", "#about"],
];

export function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export const P = {
  home: "M3 10.5 12 3l9 7.5V21H3z M9 21v-6h6v6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  x: "M6 6l12 12 M18 6 6 18",
  heart: "M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2z",
  search: "M11 4a7 7 0 1 0 4.9 12L21 21",
  arrow: "M5 12h14 M13 6l6 6-6 6",
};

export default function Navbar({ active }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open ]);

  return (
    <>
      <nav className={`spnav${solid ? " solid" : ""}`} aria-label="Primary">
        <a className="logo" href="#home"><i /> Spotlight <b /></a>
        <div className="links">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} className={active === h.slice(1) ? "on" : ""} aria-current={active === h.slice(1) ? "true" : undefined}>{l}</a>
          ))}
        </div>
        <div className="nav-r">
          <a className="cta" href="#access">Get access →</a>
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
            <Icon d={P.menu} />
          </button>
        </div>
      </nav>
      {open && (
        <div className="mmenu" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="mm-x" onClick={() => setOpen(false)} aria-label="Close menu"><Icon d={P.x} /></button>
          <div className="mm-links">
            {[["Home", "#home"], ...LINKS].map(([l, h]) => (
              <a key={h + l} href={h} onClick={() => setOpen(false)}>{l}</a>
            ))}
            <a className="cta" href="#access" onClick={() => setOpen(false)}>Get access →</a>
          </div>
        </div>
      )}
    </>
  );
}
